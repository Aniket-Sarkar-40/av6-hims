// Optional keys WITHOUT using `{}`
// (if Pick<T,K> is not assignable to its Required version, K was optional)
type OptionalPropKeys<T> = {
  [K in keyof T]-?: Pick<T, K> extends Required<Pick<T, K>> ? never : K;
}[keyof T];

// Keys whose type includes null
type NullishKeys<T> = {
  [K in keyof T]-?: null extends T[K] ? K : never;
}[keyof T];

// Treat (optional OR nullable) as optional in FormData
type AutoOptionalKeys<T> = OptionalPropKeys<T> | NullishKeys<T>;
type AutoRequiredKeys<T> = Exclude<keyof T, AutoOptionalKeys<T>>;

// Map to FormData:
// - Required keys → required string
// - Optional/nullable keys → optional (string | undefined)
// You can still override with ForceRequired / ForceOptional if needed.
export type FormData<
  T,
  ForceRequired extends keyof T = never,
  ForceOptional extends keyof T = never,
> = {
  [K in Exclude<AutoRequiredKeys<T>, ForceOptional> | ForceRequired]-?: string;
} & {
  [K in Exclude<
    keyof T,
    Exclude<AutoRequiredKeys<T>, ForceOptional> | ForceRequired
  >]?: string | undefined;
};

// usage:

// type User = {
//   id: number;             // required
//   name?: string;          // optional
//   email: string | null;   // nullable
// };

// use case-1:(Normal)

// // => id: string     (required)
// // => name?: string  (optional)
// // => email?: string (optional)
// type UserForm = FormData<User>;

//use case-2:(Forcefully require)

// Force email to be required, even though it's nullable
// type UserFormStrict = FormData<User, 'email'>;

// id: string (required), email: string (required), name?: string | undefined

// use case-3:(Forcefully optional)

// Force id to be optional
// type UserFormLoose = FormData<User, never, 'id'>;

// id?: string | undefined, name?: string | undefined, email?: string | undefined
