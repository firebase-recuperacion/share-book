import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public alertController: AlertController
  ) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {}

  async onSubmit() {
    if (this.loginForm.status === 'INVALID') {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      await alert.present();
    }
    
  }
}
