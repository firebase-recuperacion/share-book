import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/alert.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public alertController: AlertController,
    public firebaseAuth: AngularFireAuth,
    private db: AngularFirestore,
    public router: Router,
    public alert: AlertService
  ) {}

  @Input() type: string;

  signupForm: FormGroup;

  async setFormData() {
    if (this.type === 'update') {
      await this.alert.presentLoading();
      const currentUser = await this.firebaseAuth.currentUser;
      const usersRef = await this.db.collection('users').doc(currentUser.uid);
      const doc = (await usersRef.get()).toPromise();
      const userDoc = await doc;
      Object.keys(userDoc.data()).forEach((value) => {
        if (this.signupForm.controls[value]) {
          this.signupForm.controls[value].setValue(userDoc.data()[value]);
          this.alert.loading.dismiss();
        }
      });
      return null;
    }
  }

  async ngOnInit() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('[- +()0-9]+')]],
      address: ['', [Validators.required]],
    });
    await this.setFormData();
  }

  async onSubmit() {
    if (this.type === 'update') {
      this.onUpdate();
      return;
    }
    this.onCreate();
  }

  async onCreate() {
    if (this.signupForm.status === 'INVALID') {
      await this.alert.present({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
    await this.alert.presentLoading();
    try {
      const { email, password, phone, name, address } = this.signupForm.value;
      await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
      this.firebaseAuth.onAuthStateChanged(async (user) => {
        if (user) {
          const userRef = await this.db.collection('users').doc(user.uid);
          await userRef.set({
            uid: user.uid,
            email,
            phone,
            name,
            address,
          });
          await this.alert.loading.dismiss();
          await this.alert.present({
            header: '¡Bienvenido!',
            message: 'Se ha registrado correctamente',
            buttons: ['Ok'],
          });
          this.router.navigate(['/']);
        }
      });
    } catch (err) {
      await this.alert.loading.dismiss();
      this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  async onUpdate() {
    if (this.signupForm.status === 'INVALID') {
      await this.alert.present({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
    await this.alert.presentLoading();
    try {
      const { email, password, phone, name, address } = this.signupForm.value;
      const currentUser = await this.firebaseAuth.currentUser;
      await currentUser.updateEmail(email);
      await currentUser.updatePassword(password);
      const userRef = await this.db.collection('users').doc(currentUser.uid);
      await userRef.set({
        uid: currentUser.uid,
        email,
        phone,
        name,
        address,
      });
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Modificado',
        message: 'Perfil modificado correctamente',
        buttons: ['Ok'],
      });
      this.router.navigate(['/']);
    } catch (err) {
      await this.alert.loading.dismiss();
      this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }
}
