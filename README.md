# Intern Task Hub — Frontend

Eğitim amaçlı **Intern Task Hub** uygulamasının Angular arayüzü.
İlk aşama: basit login ekranı + token tabanlı korumalı dashboard.

## Teknolojiler

- Angular 18 (standalone components) · TypeScript · SCSS
- Angular Router · HttpClient (functional interceptor)

## Önkoşullar

- **Node 20** (`nvm use 20.19.0`) — global Angular CLI 12 ve Node 16 ile
  derlenmez.

## Kurulum & Çalıştırma

```powershell
nvm use 20.19.0
npm install        # ilk seferde
npm start          # ng serve -> http://localhost:4200
```

Backend'in **http://localhost:8082** adresinde çalışıyor olması gerekir
(adres: `src/environments/environment.ts` → `apiUrl`).

## Akış

1. `/login` ekranından kullanıcı adı/şifre ile backend'e istek atılır.
2. Dönen JWT token ve kullanıcı/menü bilgisi `localStorage`'a kaydedilir.
3. Başarılı girişte `/dashboard`'a yönlendirilir.
4. `AuthGuard`, token yoksa `/dashboard`'ı açtırmaz, `/login`'e atar.
5. `AuthInterceptor`, her isteğe `Authorization: Bearer <token>` ekler.

Test kullanıcıları: `admin / 123456` (ADMIN), `intern / 123456` (INTERN).

## Yapı

```
src/app
 ├── core
 │    ├── auth.service.ts       login, token & oturum yönetimi (localStorage)
 │    ├── auth.guard.ts         korumalı rota guard'ı (CanActivateFn)
 │    ├── auth.interceptor.ts   Bearer token ekleyen interceptor
 │    └── models.ts             paylaşılan tipler
 ├── login                      LoginComponent (giriş ekranı)
 ├── dashboard                  DashboardComponent (kullanıcı + menü)
 ├── app.routes.ts              rota tanımları
 └── app.config.ts             router + HttpClient + interceptor sağlayıcıları
```
