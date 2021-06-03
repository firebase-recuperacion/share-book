import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage {
  formType = 'update';
  constructor(private firebaseAuth: AngularFireAuth, public alert: AlertService, private router: Router) {}

  async logout() {
    try {
      this.firebaseAuth.signOut()
      this.router.navigate(['/'])
    } catch (err) {
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok']
      })
    }
  }
}
