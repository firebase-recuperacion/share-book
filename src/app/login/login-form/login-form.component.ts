import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertService } from 'src/app/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public alertController: AlertController,
    private firebaseAuth: AngularFireAuth,
    public alert: AlertService,
    public router: Router
  ) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {}

  async onSubmit() {
    await this.alert.presentLoading();
    if (this.loginForm.status === 'INVALID') {
      await this.alert.present({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
    try {
      const { email, password } = this.loginForm.value;
      this.firebaseAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/']);
      this.alert.loading.dismiss();
    } catch (err) {
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }
}
