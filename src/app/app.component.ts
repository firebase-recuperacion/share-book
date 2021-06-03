import { Component, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from './login/auth.service';
import { LoadingController } from '@ionic/angular';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    public loadingController: LoadingController,
    private auth: AuthService,
    public zone: NgZone,
    public alert: AlertService
  ) {}

  ngOnInit() {
    this.alert.presentLoading();
    this.firebaseAuth.onAuthStateChanged(async (user) => {
      this.auth.currentUser$.next(user);
      if (user) {
        this.alert.loading.dismiss();
        this.zone.run(() => {});
      }
      setTimeout(() => {
        this.alert.loading.dismiss();
      }, 1000);
    });
  }
}
