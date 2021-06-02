import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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
    public router: Router
  ) {}

  @Input() type: string;

  signupForm: FormGroup;

  async setFormData() {
    if (this.type === 'update') {
      const currentUser = await this.firebaseAuth.currentUser;
      const usersRef = await this.db.collection('users').doc(currentUser.uid)
      const doc = (await usersRef.get()).toPromise()
      const userDoc = await doc;
      Object.keys(userDoc.data()).forEach((value) => {
        if (this.signupForm.controls[value]) {
          this.signupForm.controls[value].setValue(userDoc.data()[value]);
        }
      })
      return null
    }
  }

  async ngOnInit() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: [
        '',
        [Validators.required, Validators.pattern('[- +()0-9]+')],
      ],
      address: ['', [Validators.required]],
    });
    await this.setFormData();
  }

  async presentAlert(args) {
    const alert = await this.alertController.create(args);
    await alert.present();
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
      await this.presentAlert({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
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
          this.router.navigate(['/']);
        }
      });
    } catch (err) {
      this.presentAlert({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  async onUpdate() {
    if (this.signupForm.status === 'INVALID') {
      await this.presentAlert({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
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
          this.router.navigate(['/']);
        }
      });
    } catch (err) {
      this.presentAlert({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }
}
