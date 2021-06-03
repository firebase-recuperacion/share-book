import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    public alertController: AlertController,
    public loadingController: LoadingController
  ) {}

  loading: HTMLIonLoadingElement;

  async present(args) {
    const alert = await this.alertController.create(args);
    await alert.present();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await this.loading.present();
  }
}
