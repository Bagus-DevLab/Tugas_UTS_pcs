# Whitebox Testing: Statement dan Decision Testing

Dokumen ini menjelaskan implementasi whitebox testing pada project MAPAN. Teknik yang digunakan adalah **statement testing** dan **decision testing** berdasarkan kode nyata pada model `User` dan controller `UserManagementController`.

## Tujuan

Whitebox testing dibuat dengan melihat struktur internal kode program. Fokus pengujian:

- **Statement testing**: memastikan setiap statement penting dieksekusi minimal satu kali.
- **Decision testing**: memastikan setiap keputusan/percabangan diuji pada outcome `true` dan `false`.

File test khusus whitebox:

```text
tests/Feature/Whitebox/UserWhiteboxTest.php
```

## Rumus Coverage

```text
Statement Coverage = (Jumlah statement yang dieksekusi / Total statement) x 100%

Decision Coverage = (Jumlah outcome decision yang diuji / Total outcome decision) x 100%
```

## Objek Uji 1: Role Helper pada Model User

File kode:

```text
app/Models/User.php
```

Fungsi yang diuji:

```php
public function isSuperAdmin(): bool
{
    return $this->role === self::ROLE_SUPER_ADMIN;
}

public function isAdmin(): bool
{
    return $this->role === self::ROLE_ADMIN;
}

public function isPakar(): bool
{
    return $this->role === self::ROLE_PAKAR;
}

public function isUser(): bool
{
    return $this->role === self::ROLE_USER;
}

public function isAtLeastAdmin(): bool
{
    return in_array($this->role, [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
        self::ROLE_PAKAR,
    ]);
}

public function canManageKnowledgeBase(): bool
{
    return in_array($this->role, [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_PAKAR,
    ]);
}

public function canManageSystem(): bool
{
    return in_array($this->role, [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
    ]);
}

public function canManageUsers(): bool
{
    return $this->role === self::ROLE_SUPER_ADMIN;
}
```

### Statement Testing

Setiap fungsi di atas memiliki statement `return`. Test menjalankan semua statement tersebut untuk semua role utama:

| Test Case | Role | Statement yang Diuji |
|---|---|---|
| TC01 | `super_admin` | Semua statement return helper role |
| TC02 | `admin` | Semua statement return helper role |
| TC03 | `pakar` | Semua statement return helper role |
| TC04 | `user` | Semua statement return helper role |

Karena semua fungsi helper dipanggil pada setiap test case, semua statement `return` pada objek uji ini dieksekusi.

### Decision Testing

Decision yang diuji:

| Decision | Kondisi |
|---|---|
| D1 | `role === super_admin` |
| D2 | `role === admin` |
| D3 | `role === pakar` |
| D4 | `role === user` |
| D5 | `role in [super_admin, admin, pakar]` |
| D6 | `role in [super_admin, pakar]` |
| D7 | `role in [super_admin, admin]` |
| D8 | `role === super_admin` untuk manage users |

Tabel expected result:

| Role | isSuperAdmin | isAdmin | isPakar | isUser | isAtLeastAdmin | canManageKnowledgeBase | canManageSystem | canManageUsers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `super_admin` | true | false | false | false | true | true | true | true |
| `admin` | false | true | false | false | true | false | true | false |
| `pakar` | false | false | true | false | true | true | false | false |
| `user` | false | false | false | true | false | false | false | false |

Hasil decision coverage:

```text
Total decision outcome = 8 decision x 2 outcome = 16
Outcome yang diuji = 16
Decision Coverage = 16 / 16 x 100% = 100%
```

## Objek Uji 2: Update User Role

File kode:

```text
app/Http/Controllers/Admin/UserManagementController.php
```

Potongan kode:

```php
public function update(Request $request, User $user)
{
    if ($user->id === Auth::id()) {
        return redirect()->back()
            ->with('error', 'Anda tidak dapat mengubah role Anda sendiri.');
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
        'role' => ['required', Rule::in(User::ROLES)],
    ]);

    $user->update([
        'name' => $validated['name'],
        'email' => $validated['email'],
    ]);
    $user->role = $validated['role'];
    $user->save();

    return redirect()->route('admin.system.users.index')
        ->with('success', "User {$user->name} berhasil diperbarui.");
}
```

### Statement Testing

| Test Case | Kondisi | Statement yang Dieksekusi |
|---|---|---|
| TC05 | Super admin mengubah role dirinya sendiri | `if` true, return error |
| TC06 | Super admin mengubah user lain | validasi, update name/email, set role, save, return success |

Dengan dua test case tersebut, statement utama pada jalur gagal dan jalur sukses dieksekusi.

### Decision Testing

Decision:

```text
D9 = user target adalah user yang sedang login?
```

| Test Case | `$user->id === Auth::id()` | Expected |
|---|---:|---|
| TC05 | true | Update diblokir |
| TC06 | false | Update berhasil |

Coverage:

```text
Total decision outcome = 2
Outcome yang diuji = 2
Decision Coverage = 2 / 2 x 100% = 100%
```

## Objek Uji 3: Delete User

File kode:

```text
app/Http/Controllers/Admin/UserManagementController.php
```

Potongan kode:

```php
public function destroy(User $user)
{
    if ($user->id === Auth::id()) {
        return redirect()->back()
            ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
    }

    if ($user->isSuperAdmin()) {
        return redirect()->back()
            ->with('error', 'Tidak dapat menghapus akun Super Admin.');
    }

    $user->delete();

    return redirect()->route('admin.system.users.index')
        ->with('success', 'User berhasil dihapus.');
}
```

### Statement Testing

Statement penting:

| Statement | Deskripsi |
|---|---|
| S1 | Cek apakah target adalah akun sendiri |
| S2 | Return error jika menghapus akun sendiri |
| S3 | Cek apakah target adalah super admin |
| S4 | Return error jika target super admin |
| S5 | `$user->delete()` |
| S6 | Return success setelah delete |

Test case:

| Test Case | Kondisi | Statement yang Dieksekusi |
|---|---|---|
| TC07 | Menghapus akun sendiri | S1, S2 |
| TC08 | Menghapus super admin lain | S1, S3, S4 |
| TC09 | Menghapus user biasa | S1, S3, S5, S6 |

Coverage:

```text
Total statement = 6
Statement yang dieksekusi = 6
Statement Coverage = 6 / 6 x 100% = 100%
```

### Decision Testing

Decision:

```text
D10 = target adalah akun sendiri?
D11 = target adalah super_admin?
```

Decision table:

| Rule | D10: Self Delete? | D11: Target Super Admin? | Expected |
|---|---:|---:|---|
| R1 | true | tidak dicek | User tidak terhapus, error self-delete |
| R2 | false | true | User tidak terhapus, error super admin |
| R3 | false | false | User terhapus, success |

Coverage:

```text
D10 outcome true  = diuji oleh R1
D10 outcome false = diuji oleh R2 dan R3
D11 outcome true  = diuji oleh R2
D11 outcome false = diuji oleh R3

Total decision outcome = 4
Outcome yang diuji = 4
Decision Coverage = 4 / 4 x 100% = 100%
```

## Cara Menjalankan Test

Menjalankan hanya test whitebox:

```bash
php artisan test tests/Feature/Whitebox/UserWhiteboxTest.php
```

Menjalankan seluruh test backend sesuai SOP project:

```bash
composer test
```

## Kesimpulan

Whitebox testing pada project ini dilakukan dengan membaca struktur kode, menentukan statement dan decision, lalu membuat test case yang melewati semua jalur utama. Berdasarkan objek uji di atas:

- Statement coverage untuk `destroy()` mencapai 100%.
- Decision coverage untuk role helper, update user, dan delete user mencapai 100%.
- Test dibuat sebagai bukti executable pada `tests/Feature/Whitebox/UserWhiteboxTest.php`.
