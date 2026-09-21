<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('permissions')
            ->orderByRaw("FIELD(status,'active','invited','suspended')")
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => $this->userRow($u));

        return Inertia::render('settings/users/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('settings/users/form', [
            'user' => null,
            'permissions' => [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'role' => ['required', Rule::in(User::ROLES)],
            'status' => ['required', Rule::in(User::STATUSES)],
            'permissions' => ['required', 'array'],
            'send_invite' => ['boolean'],
        ]);

        // Validate at least one module has view access
        $hasAccess = collect($data['permissions'])->contains(fn ($p) => ! empty($p['can_view']));
        if (! $hasAccess) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => ['permissions' => ['Give the user access to at least one module.']]], 422);
            }

            return back()->withErrors(['permissions' => 'Give the user access to at least one module.']);
        }

        $inviteToken = null;
        if (! empty($data['send_invite'])) {
            $inviteToken = Str::random(64);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'role' => $data['role'],
            'status' => ! empty($data['send_invite']) ? 'invited' : $data['status'],
            'password' => Hash::make(Str::random(32)),
            'invited_at' => ! empty($data['send_invite']) ? now() : null,
            'invitation_token' => $inviteToken,
            'invitation_expires_at' => $inviteToken ? now()->addDays(7) : null,
        ]);

        $this->syncPermissions($user, $data['permissions']);

        // TODO: send invitation email when mail is configured
        // Mail::to($user->email)->send(new UserInvitation($user, $inviteToken));

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => "Invitation sent to {$user->email}"]);
    }

    public function edit(User $user)
    {
        $user->load('permissions');

        $permsMap = [];
        foreach ($user->permissions as $p) {
            $permsMap[$p->module] = [
                'can_view' => $p->can_view,
                'can_create' => $p->can_create,
                'can_edit' => $p->can_edit,
                'can_delete' => $p->can_delete,
            ];
        }

        return Inertia::render('settings/users/form', [
            'user' => $this->userRow($user),
            'permissions' => $permsMap,
        ]);
    }

    public function update(Request $request, User $user)
    {
        // Cannot edit own permissions/role
        if ($request->user()->id === $user->id) {
            return back()->withErrors(['general' => "You can't edit your own account settings."]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'role' => ['required', Rule::in(User::ROLES)],
            'status' => ['required', Rule::in(User::STATUSES)],
            'permissions' => ['required', 'array'],
        ]);

        // At least one module with view
        $hasAccess = collect($data['permissions'])->contains(fn ($p) => ! empty($p['can_view']));
        if (! $hasAccess) {
            if ($request->expectsJson()) {
                return response()->json(['errors' => ['permissions' => ['Give the user access to at least one module.']]], 422);
            }

            return back()->withErrors(['permissions' => 'Give the user access to at least one module.']);
        }

        // Cannot leave zero active admins
        if ($data['status'] !== 'active' || $data['role'] !== 'administrator') {
            $isCurrentlyAdmin = $user->role === 'administrator' && $user->status === 'active';
            if ($isCurrentlyAdmin) {
                $otherActiveAdmins = User::where('id', '!=', $user->id)
                    ->where('role', 'administrator')
                    ->where('status', 'active')
                    ->count();
                if ($otherActiveAdmins === 0) {
                    return back()->withErrors(['general' => 'There must be at least one active administrator.']);
                }
            }
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'job_title' => $data['job_title'] ?? null,
            'role' => $data['role'],
            'status' => $data['status'],
        ]);

        $this->syncPermissions($user, $data['permissions']);

        return redirect()->route('users.index')
            ->with('toast', ['type' => 'success', 'message' => "{$user->name} updated"]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['error' => "You can't remove your own account"], 403);
        }

        // Cannot remove last active admin
        if ($user->role === 'administrator' && $user->status === 'active') {
            $otherActiveAdmins = User::where('id', '!=', $user->id)
                ->where('role', 'administrator')
                ->where('status', 'active')
                ->count();
            if ($otherActiveAdmins === 0) {
                return response()->json(['error' => 'There must be at least one active administrator.'], 403);
            }
        }

        $user->delete();

        return response()->json(['ok' => true]);
    }

    public function suspend(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['error' => "You can't suspend your own account"], 403);
        }

        // Cannot suspend last active admin
        if ($user->role === 'administrator' && $user->status === 'active') {
            $otherActiveAdmins = User::where('id', '!=', $user->id)
                ->where('role', 'administrator')
                ->where('status', 'active')
                ->count();
            if ($otherActiveAdmins === 0) {
                return response()->json(['error' => 'There must be at least one active administrator.'], 403);
            }
        }

        $newStatus = $user->status === 'suspended' ? 'active' : 'suspended';
        $user->update(['status' => $newStatus]);

        return response()->json(['ok' => true, 'status' => $newStatus]);
    }

    private function syncPermissions(User $user, array $permissions): void
    {
        foreach (Permission::MODULES as $module) {
            $p = $permissions[$module] ?? [];
            Permission::updateOrCreate(
                ['user_id' => $user->id, 'module' => $module],
                [
                    'can_view' => ! empty($p['can_view']),
                    'can_create' => ! empty($p['can_create']),
                    'can_edit' => ! empty($p['can_edit']),
                    'can_delete' => ! empty($p['can_delete']),
                ]
            );
        }
    }

    private function userRow(User $user): array
    {
        $perms = $user->permissions;
        $viewable = $perms->filter(fn ($p) => $p->can_view)->pluck('module')->values()->toArray();

        if (count($viewable) === 0) {
            $access = 'No access';
        } elseif (count($viewable) === count(Permission::MODULES)) {
            $access = 'All modules';
        } elseif (count($viewable) <= 2) {
            $access = implode(', ', array_map(fn ($m) => ucfirst($m), $viewable));
        } else {
            $first2 = array_slice($viewable, 0, 2);
            $rest = count($viewable) - 2;
            $access = implode(', ', array_map(fn ($m) => ucfirst($m), $first2))." +{$rest}";
        }

        $canDelete = $perms->contains(fn ($p) => $p->can_delete);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'job_title' => $user->job_title,
            'role' => $user->role,
            'status' => $user->status,
            'last_active' => $this->formatLastActive($user->last_active_at),
            'access' => $access,
            'can_delete' => $canDelete,
            'permissions' => $perms->keyBy('module')->map(fn ($p) => [
                'can_view' => $p->can_view,
                'can_create' => $p->can_create,
                'can_edit' => $p->can_edit,
                'can_delete' => $p->can_delete,
            ])->toArray(),
        ];
    }

    private function formatLastActive($dt): string
    {
        if (! $dt) {
            return 'Never';
        }
        $diff = now()->diffInMinutes($dt);
        if ($diff < 5) {
            return 'Active now';
        }
        if ($diff < 120) {
            return round($diff / 60).' hours ago';
        }
        if ($diff < 60 * 27) {
            return 'Yesterday';
        }
        $days = round($diff / (60 * 24));

        return "{$days} days ago";
    }
}
