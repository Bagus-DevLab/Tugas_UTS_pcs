# Whitebox Testing CFG: Manajemen User dan Role

Dokumen ini menjelaskan pengujian whitebox untuk fitur manajemen user dan role pada project MAPAN. Fokus pengujian adalah struktur internal kode, terutama percabangan pada `UserManagementController` dan helper permission pada model `User`.

## Objek Pengujian

| Objek | File | Fokus |
|---|---|---|
| Role helper | `app/Models/User.php` | Mengecek role dan permission user |
| Update user | `app/Http/Controllers/Admin/UserManagementController.php` | Mencegah user mengubah role sendiri dan menguji update role user lain |
| Delete user | `app/Http/Controllers/Admin/UserManagementController.php` | Mencegah self-delete, mencegah hapus super admin, dan menguji delete user biasa |
| Test executable | `tests/Feature/Whitebox/UserWhiteboxTest.php` | Bukti test case berjalan di project |

## Ringkasan Metode

Whitebox testing melihat struktur kode program. Setiap proses dan percabangan dibuat menjadi node dalam Control Flow Graph (CFG).

Istilah yang digunakan:

| Istilah | Arti |
|---|---|
| Node | Titik proses atau keputusan dalam kode |
| Edge | Panah/alur dari satu node ke node lain |
| Decision node | Node percabangan, misalnya `if` |
| Independent path | Jalur unik yang harus diuji minimal satu kali |
| Cyclomatic Complexity | Jumlah jalur independen minimum yang perlu diuji |

Rumus yang digunakan:

```text
V(G) = E - N + 2
```

Keterangan:

```text
V(G) = Cyclomatic Complexity
E    = jumlah edge
N    = jumlah node
```

Rumus alternatif untuk kode tanpa loop kompleks:

```text
V(G) = jumlah decision + 1
```

---

## CFG 1: Role Helper pada Model User

### Kode yang Diuji

Helper role berada di `app/Models/User.php`:

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

### Node

| Node | Deskripsi |
|---|---|
| R1 | Start: user memiliki nilai `role` |
| R2 | Cek `role === super_admin` |
| R3 | Cek `role === admin` |
| R4 | Cek `role === pakar` |
| R5 | Cek `role === user` |
| R6 | Cek role termasuk `[super_admin, admin, pakar]` untuk `isAtLeastAdmin()` |
| R7 | Cek role termasuk `[super_admin, pakar]` untuk `canManageKnowledgeBase()` |
| R8 | Cek role termasuk `[super_admin, admin]` untuk `canManageSystem()` |
| R9 | Cek `role === super_admin` untuk `canManageUsers()` |
| R10 | End: hasil boolean dikembalikan |

### Edge

```text
R1 -> R2 -> R3 -> R4 -> R5 -> R6 -> R7 -> R8 -> R9 -> R10
```

Setiap node decision menghasilkan nilai `true` atau `false`. Karena helper dipanggil untuk semua role utama, outcome `true` dan `false` dari setiap helper dapat diuji.

### HTML/SVG CFG

<svg width="920" height="170" viewBox="0 0 920 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CFG role helper">
  <defs>
    <marker id="arrow-role" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155"/>
    </marker>
  </defs>
  <style>
    .node { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; }
    .decision { fill: #fff7ed; stroke: #ea580c; stroke-width: 2; }
    .text { font: 12px Arial, sans-serif; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
    .edge { stroke: #334155; stroke-width: 2; marker-end: url(#arrow-role); }
  </style>
  <rect class="node" x="20" y="60" width="70" height="42" rx="18"/>
  <text class="text" x="55" y="81">R1 Start</text>
  <polygon class="decision" points="135,40 185,81 135,122 85,81"/>
  <text class="text" x="135" y="81">R2</text>
  <polygon class="decision" points="225,40 275,81 225,122 175,81"/>
  <text class="text" x="225" y="81">R3</text>
  <polygon class="decision" points="315,40 365,81 315,122 265,81"/>
  <text class="text" x="315" y="81">R4</text>
  <polygon class="decision" points="405,40 455,81 405,122 355,81"/>
  <text class="text" x="405" y="81">R5</text>
  <polygon class="decision" points="495,40 545,81 495,122 445,81"/>
  <text class="text" x="495" y="81">R6</text>
  <polygon class="decision" points="585,40 635,81 585,122 535,81"/>
  <text class="text" x="585" y="81">R7</text>
  <polygon class="decision" points="675,40 725,81 675,122 625,81"/>
  <text class="text" x="675" y="81">R8</text>
  <polygon class="decision" points="765,40 815,81 765,122 715,81"/>
  <text class="text" x="765" y="81">R9</text>
  <rect class="node" x="830" y="60" width="70" height="42" rx="18"/>
  <text class="text" x="865" y="81">R10 End</text>
  <line class="edge" x1="90" y1="81" x2="84" y2="81"/>
  <line class="edge" x1="185" y1="81" x2="174" y2="81"/>
  <line class="edge" x1="275" y1="81" x2="264" y2="81"/>
  <line class="edge" x1="365" y1="81" x2="354" y2="81"/>
  <line class="edge" x1="455" y1="81" x2="444" y2="81"/>
  <line class="edge" x1="545" y1="81" x2="534" y2="81"/>
  <line class="edge" x1="635" y1="81" x2="624" y2="81"/>
  <line class="edge" x1="725" y1="81" x2="714" y2="81"/>
  <line class="edge" x1="815" y1="81" x2="829" y2="81"/>
  <text class="text" x="135" y="142">super_admin?</text>
  <text class="text" x="225" y="142">admin?</text>
  <text class="text" x="315" y="142">pakar?</text>
  <text class="text" x="405" y="142">user?</text>
  <text class="text" x="585" y="142">permission checks</text>
</svg>

### Test Case Role Helper

| Test Case | Role | Tujuan |
|---|---|---|
| TC-R1 | `super_admin` | Menguji permission penuh, termasuk `canManageUsers = true` |
| TC-R2 | `admin` | Menguji akses sistem, tetapi tidak bisa kelola knowledge base dan user |
| TC-R3 | `pakar` | Menguji akses knowledge base, tetapi tidak bisa kelola sistem dan user |
| TC-R4 | `user` | Menguji role user biasa tanpa permission admin |

### Expected Result

| Role | isSuperAdmin | isAdmin | isPakar | isUser | isAtLeastAdmin | canManageKnowledgeBase | canManageSystem | canManageUsers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `super_admin` | true | false | false | false | true | true | true | true |
| `admin` | false | true | false | false | true | false | true | false |
| `pakar` | false | false | true | false | true | true | false | false |
| `user` | false | false | false | true | false | false | false | false |

---

## CFG 2: Update User Role

### Kode yang Diuji

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

### Node

| Node | Deskripsi |
|---|---|
| U1 | Start method `update()` |
| U2 | Decision: apakah target user adalah akun yang sedang login? |
| U3 | Return error jika user mengubah role sendiri |
| U4 | Validasi input `name`, `email`, dan `role` |
| U5 | Update `name` dan `email` |
| U6 | Set role baru pada user |
| U7 | Simpan perubahan ke database |
| U8 | Return redirect success |
| U9 | End |

### Edge

```text
U1 -> U2
U2 -> U3 jika true
U2 -> U4 jika false
U3 -> U9
U4 -> U5 -> U6 -> U7 -> U8 -> U9
```

### HTML/SVG CFG

<svg width="760" height="360" viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CFG update user">
  <defs>
    <marker id="arrow-update" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155"/>
    </marker>
  </defs>
  <style>
    .node { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; }
    .decision { fill: #fff7ed; stroke: #ea580c; stroke-width: 2; }
    .text { font: 13px Arial, sans-serif; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
    .edge { stroke: #334155; stroke-width: 2; fill: none; marker-end: url(#arrow-update); }
    .label { font: 12px Arial, sans-serif; fill: #475569; }
  </style>
  <rect class="node" x="310" y="20" width="140" height="42" rx="18"/>
  <text class="text" x="380" y="41">U1 Start update</text>
  <polygon class="decision" points="380,90 500,145 380,200 260,145"/>
  <text class="text" x="380" y="137">U2 Target user</text>
  <text class="text" x="380" y="154">sama dengan login?</text>
  <rect class="node" x="35" y="124" width="190" height="42" rx="8"/>
  <text class="text" x="130" y="145">U3 Return error</text>
  <rect class="node" x="555" y="75" width="160" height="42" rx="8"/>
  <text class="text" x="635" y="96">U4 Validasi input</text>
  <rect class="node" x="555" y="135" width="160" height="42" rx="8"/>
  <text class="text" x="635" y="156">U5 Update data</text>
  <rect class="node" x="555" y="195" width="160" height="42" rx="8"/>
  <text class="text" x="635" y="216">U6 Set role baru</text>
  <rect class="node" x="555" y="255" width="160" height="42" rx="8"/>
  <text class="text" x="635" y="276">U7 Save + U8 success</text>
  <rect class="node" x="310" y="295" width="140" height="42" rx="18"/>
  <text class="text" x="380" y="316">U9 End</text>
  <path class="edge" d="M380 62 L380 89"/>
  <path class="edge" d="M260 145 L226 145"/>
  <path class="edge" d="M500 145 C525 145 525 96 554 96"/>
  <path class="edge" d="M130 166 C130 316 260 316 309 316"/>
  <path class="edge" d="M635 117 L635 134"/>
  <path class="edge" d="M635 177 L635 194"/>
  <path class="edge" d="M635 237 L635 254"/>
  <path class="edge" d="M555 276 C500 276 500 316 451 316"/>
  <text class="label" x="232" y="135">True</text>
  <text class="label" x="510" y="132">False</text>
</svg>

### Cyclomatic Complexity

Menggunakan rumus `V(G) = E - N + 2`:

```text
N = 9
E = 9
V(G) = 9 - 9 + 2 = 2
```

Menggunakan rumus decision:

```text
Jumlah decision = 1
V(G) = 1 + 1 = 2
```

Jadi minimal ada 2 independent path.

### Independent Path

| Path | Alur | Skenario |
|---|---|---|
| P-U1 | U1 -> U2 -> U3 -> U9 | User mencoba mengubah role dirinya sendiri |
| P-U2 | U1 -> U2 -> U4 -> U5 -> U6 -> U7 -> U8 -> U9 | Super admin mengubah data dan role user lain |

### Test Case Update User

| Test Case | Input/Skenario | Path | Expected Result |
|---|---|---|---|
| TC-U1 | Super admin mengirim request update ke akun sendiri | P-U1 | Redirect back dan session error `Anda tidak dapat mengubah role Anda sendiri.` |
| TC-U2 | Super admin mengubah user biasa menjadi admin | P-U2 | Data user berubah, role berubah, redirect success |

---

## CFG 3: Delete User

### Kode yang Diuji

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

### Node

| Node | Deskripsi |
|---|---|
| D1 | Start method `destroy()` |
| D2 | Decision: apakah target user adalah akun yang sedang login? |
| D3 | Return error jika menghapus akun sendiri |
| D4 | Decision: apakah target user adalah super admin? |
| D5 | Return error jika target adalah super admin |
| D6 | Hapus user dari database |
| D7 | Return redirect success |
| D8 | End |

### Edge

```text
D1 -> D2
D2 -> D3 jika true
D2 -> D4 jika false
D3 -> D8
D4 -> D5 jika true
D4 -> D6 jika false
D5 -> D8
D6 -> D7
D7 -> D8
```

### HTML/SVG CFG

<svg width="780" height="410" viewBox="0 0 780 410" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CFG delete user">
  <defs>
    <marker id="arrow-delete" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155"/>
    </marker>
  </defs>
  <style>
    .node { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; }
    .decision { fill: #fff7ed; stroke: #ea580c; stroke-width: 2; }
    .text { font: 13px Arial, sans-serif; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
    .edge { stroke: #334155; stroke-width: 2; fill: none; marker-end: url(#arrow-delete); }
    .label { font: 12px Arial, sans-serif; fill: #475569; }
  </style>
  <rect class="node" x="320" y="20" width="140" height="42" rx="18"/>
  <text class="text" x="390" y="41">D1 Start destroy</text>
  <polygon class="decision" points="390,90 515,145 390,200 265,145"/>
  <text class="text" x="390" y="137">D2 Target user</text>
  <text class="text" x="390" y="154">sama dengan login?</text>
  <rect class="node" x="35" y="124" width="200" height="42" rx="8"/>
  <text class="text" x="135" y="145">D3 Error self-delete</text>
  <polygon class="decision" points="390,225 515,280 390,335 265,280"/>
  <text class="text" x="390" y="272">D4 Target adalah</text>
  <text class="text" x="390" y="289">super_admin?</text>
  <rect class="node" x="35" y="259" width="200" height="42" rx="8"/>
  <text class="text" x="135" y="280">D5 Error super_admin</text>
  <rect class="node" x="560" y="235" width="155" height="42" rx="8"/>
  <text class="text" x="637" y="256">D6 Hapus user</text>
  <rect class="node" x="560" y="300" width="155" height="42" rx="8"/>
  <text class="text" x="637" y="321">D7 Success</text>
  <rect class="node" x="320" y="350" width="140" height="42" rx="18"/>
  <text class="text" x="390" y="371">D8 End</text>
  <path class="edge" d="M390 62 L390 89"/>
  <path class="edge" d="M265 145 L236 145"/>
  <path class="edge" d="M390 200 L390 224"/>
  <path class="edge" d="M135 166 C135 371 260 371 319 371"/>
  <path class="edge" d="M265 280 L236 280"/>
  <path class="edge" d="M515 280 C535 280 535 256 559 256"/>
  <path class="edge" d="M135 301 C135 371 260 371 319 371"/>
  <path class="edge" d="M637 277 L637 299"/>
  <path class="edge" d="M560 321 C500 321 500 371 461 371"/>
  <text class="label" x="238" y="135">True</text>
  <text class="label" x="405" y="214">False</text>
  <text class="label" x="238" y="270">True</text>
  <text class="label" x="522" y="270">False</text>
</svg>

### Cyclomatic Complexity

Menggunakan rumus `V(G) = E - N + 2`:

```text
N = 8
E = 9
V(G) = 9 - 8 + 2 = 3
```

Menggunakan rumus decision:

```text
Jumlah decision = 2
V(G) = 2 + 1 = 3
```

Jadi minimal ada 3 independent path.

### Independent Path

| Path | Alur | Skenario |
|---|---|---|
| P-D1 | D1 -> D2 -> D3 -> D8 | Super admin mencoba menghapus akun sendiri |
| P-D2 | D1 -> D2 -> D4 -> D5 -> D8 | Super admin mencoba menghapus super admin lain |
| P-D3 | D1 -> D2 -> D4 -> D6 -> D7 -> D8 | Super admin menghapus user biasa |

### Test Case Delete User

| Test Case | Input/Skenario | Path | Expected Result |
|---|---|---|---|
| TC-D1 | Actor menghapus akun sendiri | P-D1 | User tidak terhapus dan session error `Anda tidak dapat menghapus akun Anda sendiri.` |
| TC-D2 | Actor menghapus target dengan role `super_admin` | P-D2 | User tidak terhapus dan session error `Tidak dapat menghapus akun Super Admin.` |
| TC-D3 | Actor menghapus target dengan role `user` | P-D3 | User terhapus dan redirect success |

---

## Gabungan CFG Manajemen User dan Role

Diagram berikut menggabungkan alur umum pengujian role, update user, dan delete user.

<svg width="920" height="520" viewBox="0 0 920 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gabungan CFG manajemen user dan role">
  <defs>
    <marker id="arrow-all" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#334155"/>
    </marker>
  </defs>
  <style>
    .node { fill: #eff6ff; stroke: #2563eb; stroke-width: 2; }
    .decision { fill: #fff7ed; stroke: #ea580c; stroke-width: 2; }
    .text { font: 13px Arial, sans-serif; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
    .edge { stroke: #334155; stroke-width: 2; fill: none; marker-end: url(#arrow-all); }
    .label { font: 12px Arial, sans-serif; fill: #475569; }
  </style>
  <rect class="node" x="390" y="20" width="140" height="42" rx="18"/>
  <text class="text" x="460" y="41">Start test</text>
  <rect class="node" x="370" y="80" width="180" height="42" rx="8"/>
  <text class="text" x="460" y="101">Siapkan user + role</text>
  <polygon class="decision" points="460,145 565,190 460,235 355,190"/>
  <text class="text" x="460" y="190">Pilih objek uji</text>

  <rect class="node" x="65" y="270" width="160" height="42" rx="8"/>
  <text class="text" x="145" y="291">Uji role helper</text>
  <polygon class="decision" points="145,335 230,375 145,415 60,375"/>
  <text class="text" x="145" y="375">Permission?</text>
  <rect class="node" x="70" y="440" width="150" height="42" rx="8"/>
  <text class="text" x="145" y="461">Assert boolean</text>

  <rect class="node" x="380" y="270" width="160" height="42" rx="8"/>
  <text class="text" x="460" y="291">Uji update user</text>
  <polygon class="decision" points="460,335 545,375 460,415 375,375"/>
  <text class="text" x="460" y="375">Self-update?</text>
  <rect class="node" x="275" y="440" width="150" height="42" rx="8"/>
  <text class="text" x="350" y="461">Error update</text>
  <rect class="node" x="515" y="440" width="170" height="42" rx="8"/>
  <text class="text" x="600" y="461">Validasi + success</text>

  <rect class="node" x="700" y="250" width="160" height="42" rx="8"/>
  <text class="text" x="780" y="271">Uji delete user</text>
  <polygon class="decision" points="780,315 865,355 780,395 695,355"/>
  <text class="text" x="780" y="355">Self-delete?</text>
  <rect class="node" x="625" y="440" width="145" height="42" rx="8"/>
  <text class="text" x="697" y="461">Error self</text>
  <polygon class="decision" points="840,420 915,455 840,490 765,455"/>
  <text class="text" x="840" y="455">Super admin?</text>
  <rect class="node" x="750" y="75" width="135" height="42" rx="8"/>
  <text class="text" x="817" y="96">Error/Success</text>

  <rect class="node" x="390" y="485" width="140" height="30" rx="15"/>
  <text class="text" x="460" y="500">End</text>

  <path class="edge" d="M460 62 L460 79"/>
  <path class="edge" d="M460 122 L460 144"/>
  <path class="edge" d="M355 190 C240 190 145 230 145 269"/>
  <path class="edge" d="M460 235 L460 269"/>
  <path class="edge" d="M565 190 C690 190 780 210 780 249"/>
  <path class="edge" d="M145 312 L145 334"/>
  <path class="edge" d="M145 415 L145 439"/>
  <path class="edge" d="M220 461 C285 500 335 500 389 500"/>
  <path class="edge" d="M460 312 L460 334"/>
  <path class="edge" d="M410 410 L350 439"/>
  <path class="edge" d="M510 410 L600 439"/>
  <path class="edge" d="M425 482 C425 490 430 496 389 500"/>
  <path class="edge" d="M600 482 C560 500 545 500 531 500"/>
  <path class="edge" d="M780 292 L780 314"/>
  <path class="edge" d="M735 390 L697 439"/>
  <path class="edge" d="M823 390 L840 419"/>
  <path class="edge" d="M765 455 C700 515 580 500 531 500"/>
  <path class="edge" d="M915 455 C950 180 885 96 886 96"/>
  <text class="label" x="365" y="435">True</text>
  <text class="label" x="555" y="435">False</text>
  <text class="label" x="705" y="425">True</text>
  <text class="label" x="835" y="410">False</text>
</svg>

## Mapping ke File Test

Pengujian sudah tersedia di `tests/Feature/Whitebox/UserWhiteboxTest.php`.

| Area | Test di kode | CFG yang dicakup |
|---|---|---|
| Role helper | `covers User role helper decision outcomes for all roles` | CFG 1 |
| Update user | `covers UserManagementController update statements for blocked self role change and successful update` | CFG 2 |
| Delete user | `covers UserManagementController destroy decision branches` | CFG 3 |

## Perintah Menjalankan Test

Jalankan test whitebox saja:

```bash
php artisan test tests/Feature/Whitebox/UserWhiteboxTest.php
```

Jalankan seluruh test backend sesuai SOP project:

```bash
composer test
```

## Kesimpulan

Berdasarkan CFG:

| Objek | Jumlah Decision | Cyclomatic Complexity | Minimal Test Case |
|---|---:|---:|---:|
| Role helper | 8 helper boolean | 4 role utama untuk menutup outcome penting | 4 |
| Update user | 1 | 2 | 2 |
| Delete user | 2 | 3 | 3 |

Pengujian whitebox untuk manajemen user dan role memastikan:

- Role `super_admin`, `admin`, `pakar`, dan `user` menghasilkan permission yang benar.
- User tidak dapat mengubah role akunnya sendiri.
- User tidak dapat menghapus akunnya sendiri.
- Super admin lain tidak dapat dihapus.
- User biasa dapat dihapus oleh actor yang berwenang.
