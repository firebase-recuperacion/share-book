import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => {
  return redirectUnauthorizedTo(['/login']);
};

const redirectLoggedInToList = () => {
  return redirectLoggedInTo(['/']);
};

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'list',
        loadChildren: () =>
          import('../list/list.module').then((m) => m.ListPageModule),
      },
      {
        path: 'books',
        loadChildren: () =>
          import('../books/books.module').then((m) => m.BooksPageModule),
        ...canActivate(redirectUnauthorizedToLogin),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('../login/login.module').then((m) => m.LoginPageModule),
        ...canActivate(redirectLoggedInToList),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../profile/profile.module').then((m) => m.ProfilePageModule),
        ...canActivate(redirectUnauthorizedToLogin),
      },
      {
        path: '',
        redirectTo: '/list',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
