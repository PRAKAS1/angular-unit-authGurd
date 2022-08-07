// auth.guard.spec.ts
import { fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRouteSnapshot, convertToParamMap, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDashbaordComponent } from '../admin-dashbaord/admin-dashbaord.component';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from './authguard';

function fakeRouterState(url: string): RouterStateSnapshot {
    return {
        url,
    } as RouterStateSnapshot;
}

describe('AuthGuard', () => {

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']); // [1]
        serviceStub = {}; // [2]
        guard = new AuthGuard(serviceStub as AuthService, routerSpy); // [3]
    });

    const dummyRoute = {} as ActivatedRouteSnapshot;
    const fakeUrls = ['/','/unauthpage'];
    let guard: AuthGuard;
    let routerSpy: jasmine.SpyObj<Router>;
    let serviceStub: Partial<AuthService>;

    let hasAccessRoute = Object.assign({}, ActivatedRouteSnapshot.prototype, {
        params: {
            myParam: '/'
        }
    });

    let hasNotToBeAccessRoute = Object.assign({}, ActivatedRouteSnapshot.prototype, {
        params: {
            myParam: '/unauthpage'
        }
    });

    describe('when the user is logged in', () => {
        beforeEach(() => {
            serviceStub.isLoggedIn = true;
        });

        fakeUrls.forEach((fakeUrl) => {
            it('grants access', () => {
                const isAccessGranted = guard.getUserAcccess(hasAccessRoute);
                expect(isAccessGranted).toBeTruthy();
            });
            describe('and navigates to a guarded route configuration', () => {
                it('grants route access', () => {
                    const canActivate = guard.canActivate(dummyRoute, fakeRouterState(fakeUrl));
                    expect(canActivate).toBeTrue();
                });
            });
        });
    });

    describe('when the user is logged out', () => {
        beforeEach(() => {
            TestBed.configureTestingModule ( {
                providers: [
                    { provide: Router, useValue: routerSpy},
                ]
            } )
            serviceStub.isLoggedIn = false;
        });

        fakeUrls.forEach((fakeUrl) => {
            it('rejects access',function(done) {

                guard.getUserAcccess(hasNotToBeAccessRoute).then(function(result) {
                    expect(result).toBe(false);
                    done();
                  });
                //const isAccessGranted=spyOn(guard, 'getUserAcccess').and.returnValue(Promise.resolve(false));
                //const isAccessGranted = guard.getUserAcccess(hasNotToBeAccessRoute);
               // expect(isAccessGranted).toBeFalsy();
            });
        });
    });
});



