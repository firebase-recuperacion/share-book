import { Component, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from './login/auth.service';
import { LoadingController } from '@ionic/angular';

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
  ) {}

  loading: HTMLIonLoadingElement;

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await this.loading.present();
  }

  ngOnInit() {
    this.presentLoading();
    this.firebaseAuth.onAuthStateChanged(async (user) => {
      this.auth.currentUser$.next(user);
      if (user) {
        this.loading.dismiss();
        this.zone.run(() => {});
      }
      setTimeout(() => {
        this.loading.dismiss();
      }, 1000);
    });
  }
}
