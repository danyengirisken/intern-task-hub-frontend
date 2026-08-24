import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Menü (yetki) tabanlı route koruması.
 *
 * Sidebar'ı gizlemek tek başına yetmez; kullanıcı adres çubuğuna yazarak da
 * ekrana girebilir. Bu guard, gidilen adresin kullanıcının menüsündeki
 * sayfalardan biri (veya onun alt yolu) olmasını şart koşar.
 *
 * Örnek: menüde '/projeler' varsa '/projeler/duzenle/5' de açılabilir;
 * '/partnerler' yoksa CUSTOMER rolündeki kullanıcı oraya giremez.
 */
export const menuGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const pages = auth
    .getMenus()
    .map((m) => m.page)
    .filter((p): p is string => !!p);

  // Menü yoksa oturum eski sürümden kalmıştır; menüleri almak için yeniden giriş gerekir.
  if (!pages.length) {
    auth.logout();
    return false;
  }

  const url = state.url.split('?')[0].split('#')[0];

  // Dashboard her zaman açık: yönlendirme hedefi olduğu için döngüye girmemeli.
  if (url === '/' || url === '/dashboard') {
    return true;
  }

  const allowed = pages.some((page) => url === page || url.startsWith(`${page}/`));

  return allowed ? true : router.createUrlTree(['/dashboard']);
};
