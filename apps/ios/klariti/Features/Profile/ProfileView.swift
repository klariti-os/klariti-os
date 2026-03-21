//
//  ProfileView.swift
//  klariti
//

import SwiftUI

struct ProfileView: View {
    @Environment(AppStore.self) private var store

    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let user = store.currentUser {
                    signedInState(user)
                } else {
                    signedOutState
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 24)
        }
        .background(Color.klBackground.ignoresSafeArea())
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.klBackground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
    }

    @ViewBuilder
    private var signedOutState: some View {
        profileCard {
            VStack(alignment: .leading, spacing: 10) {
                Text("Sign in")
                    .font(KlFont.title)
                    .foregroundStyle(Color.klForeground)

                Text("Use your Klariti account to view your profile.")
                    .font(KlFont.subhead)
                    .foregroundStyle(Color.klSubtle)
            }
        }

        profileCard {
            VStack(alignment: .leading, spacing: 14) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    TextField("you@example.com", text: $email)
                        .textInputAutocapitalization(.never)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .font(KlFont.body)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color.klBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Password")
                        .font(KlFont.caption)
                        .foregroundStyle(Color.klSubtle)
                        .textCase(.uppercase)

                    SecureField("Your password", text: $password)
                        .textContentType(.password)
                        .font(KlFont.body)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 14)
                        .background(Color.klBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                if let authErrorMessage = store.authErrorMessage, !authErrorMessage.isEmpty {
                    Text(authErrorMessage)
                        .font(KlFont.footnote)
                        .foregroundStyle(Color.red)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Button(store.isAuthenticating ? "Signing in..." : "Sign In") {
                    Task {
                        await store.signIn(email: email, password: password)
                        if store.currentUser != nil {
                            password = ""
                        }
                    }
                }
                .buttonStyle(KlButtonStyle(enabled: canSignIn && !store.isAuthenticating))
                .disabled(!canSignIn || store.isAuthenticating)
            }
        }
    }

    @ViewBuilder
    private func signedInState(_ user: KlaritiUser) -> some View {
        profileCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Color.klBackground)
                            .frame(width: 54, height: 54)

                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 30, weight: .medium))
                            .foregroundStyle(Color.klForeground)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(user.name)
                            .font(KlFont.title)
                            .foregroundStyle(Color.klForeground)

                        Text(user.email)
                            .font(KlFont.subhead)
                            .foregroundStyle(Color.klSubtle)
                    }
                }

                Divider()

                profileField(label: "Role", value: (user.role ?? "user").capitalized)
                profileField(label: "User ID", value: user.id)

                if store.isRefreshingSession {
                    ProgressView("Refreshing profile…")
                        .font(KlFont.footnote)
                        .tint(Color.klForeground)
                }
            }
        }

        if user.isAdmin {
            profileCard {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Admin Tools")
                        .font(KlFont.headline)
                        .foregroundStyle(Color.klForeground)

                    Text("Register NFC tags and inspect their iPhone-visible identifiers from the built-in utility.")
                        .font(KlFont.subhead)
                        .foregroundStyle(Color.klSubtle)

                    NavigationLink {
                        NFCUtilityView()
                    } label: {
                        Text("Open NFC Utility")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(KlButtonStyle())
                }
            }
        }

        Button("Sign Out", role: .destructive) {
            store.signOut()
        }
        .buttonStyle(KlButtonStyle(secondary: true))
    }

    private var canSignIn: Bool {
        !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !password.isEmpty
    }

    @ViewBuilder
    private func profileField(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(KlFont.caption)
                .foregroundStyle(Color.klSubtle)
                .textCase(.uppercase)

            Text(value)
                .font(.system(size: 14, weight: .regular, design: .monospaced))
                .foregroundStyle(Color.klForeground)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    @ViewBuilder
    private func profileCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            content()
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.klMuted)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    NavigationStack {
        ProfileView()
            .environment(AppStore())
    }
}
