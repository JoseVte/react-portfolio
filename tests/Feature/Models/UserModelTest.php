<?php

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Hash;

it('can create a user', function () {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make('password123'),
    ]);

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->id)->not->toBeNull()
        ->and($user->name)->toBe('John Doe')
        ->and($user->email)->toBe('john@example.com')
        ->and(Hash::check('password123', $user->password))->toBeTrue();
});

it('can update a user', function () {
    $user = User::factory()->create();

    $user->update([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);

    $user->refresh();

    expect($user->name)->toBe('Jane Doe')
        ->and($user->email)->toBe('jane@example.com');
});

it('can delete a user', function () {
    $user = User::factory()->create();
    $userId = $user->id;

    $user->delete();

    expect(User::find($userId))->toBeNull();
});

it('hashes password when creating', function () {
    $plainPassword = 'secretpassword';

    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => $plainPassword,
    ]);

    expect($user->password)->not->toBe($plainPassword)
        ->and(Hash::check($plainPassword, $user->password))->toBeTrue();
});

it('hashes password when updating', function () {
    $user = User::factory()->create();
    $newPassword = 'newpassword123';

    $user->update(['password' => $newPassword]);

    expect(Hash::check($newPassword, $user->password))->toBeTrue();
});

it('hides password from serialization', function () {
    $user = User::factory()->create();
    $data = $user->toArray();

    expect($data)->not->toHaveKey('password');
});

it('hides remember token from serialization', function () {
    $user = User::factory()->create();
    $data = $user->toArray();

    expect($data)->not->toHaveKey('remember_token');
});

it('has unique email addresses', function () {
    User::factory()->create(['email' => 'duplicate@example.com']);

    $this->expectException(QueryException::class);
    User::create([
        'name' => 'Another User',
        'email' => 'duplicate@example.com',
        'password' => Hash::make('password'),
    ]);
});

it('mass assigns user fields', function () {
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com');
});

it('can create multiple users', function () {
    User::factory()->count(5)->create();

    expect(User::count())->toBe(5);
});

it('casts email verified at to datetime', function () {
    $user = User::factory()->unverified()->create();

    expect($user->email_verified_at)->toBeNull();

    $verifiedUser = User::factory()->create();

    expect($verifiedUser->email_verified_at)->not->toBeNull();
});

it('can authenticate with correct password', function () {
    $plainPassword = 'mypassword';
    $user = User::create([
        'name' => 'Auth User',
        'email' => 'auth@example.com',
        'password' => Hash::make($plainPassword),
    ]);

    expect(Hash::check($plainPassword, $user->password))->toBeTrue();
});

it('cannot authenticate with incorrect password', function () {
    $user = User::create([
        'name' => 'Auth User',
        'email' => 'auth@example.com',
        'password' => Hash::make('correctpassword'),
    ]);

    expect(Hash::check('wrongpassword', $user->password))->toBeFalse();
});
