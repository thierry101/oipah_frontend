/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const addToken = (request: typeof req, token: string) =>
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

  const token = authService.getAccessToken();
  const request = token ? addToken(req, token) : req;

  return next(request).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // Si on est déjà en train de refresh, on met en attente
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => next(addToken(req, newToken!)))
        );
      }

      // Lancer le refresh
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((res: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(res.access);
          return next(addToken(req, res.access));
        }),
        catchError((err) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          authService.logout();
          return throwError(() => err);
        })
      );
    })
  );
};
