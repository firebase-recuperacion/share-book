import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ɵɵtrustConstantResourceUrl,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertService } from '../alert.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit {
  @Input() type: string;

  bookForm: FormGroup;

  constructor(
    private fireStore: AngularFirestore,
    public fb: FormBuilder,
    private fireStorage: AngularFireStorage,
    private sanitizer: DomSanitizer,
    public alert: AlertService,
    private fireAuth: AngularFireAuth,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  photoBlob: Blob;
  photoWebPath: string;
  bookData;

  ngOnInit() {
    this.setParams();
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      editorial: ['', [Validators.required]],
      category: ['', [Validators.required]],
      pickupAddress: ['', [Validators.required]],
      photo: ['', [Validators.required]],
    });
  }

  setParams() {
    this.route.queryParams.subscribe(async () => {
      const currentNavigation = this.router.getCurrentNavigation();
      if (
        currentNavigation &&
        currentNavigation.extras.state &&
        currentNavigation.extras.state.type === 'new'
      ) {
        if (this.bookForm?.reset) {
          this.bookForm.reset();
        }
        this.photoBlob = null;
        this.photoWebPath = null;
        this.bookData = null;
        return;
      }
      if (
        currentNavigation &&
        currentNavigation.extras.state &&
        currentNavigation.extras.state.book
      ) {
        this.bookData = currentNavigation.extras.state.book;
        for await (let key of Object.keys(this.bookData)) {
          if (this.bookForm.controls[key]) {
            if (key === 'photo') {
              this.bookForm.controls[key].setValue('Cambiar foto');
              this.photoWebPath = this.bookData[key];
              return;
            }
            this.bookForm.controls[key].setValue(this.bookData[key]);
          }
        }
      }
    });
  }

  ionViewDidEnter() {
    this.setParams();
  }

  takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
    });
    const url = image.webPath;
    const response = await fetch(url);
    const blob = await response.blob();
    this.photoBlob = blob;
    this.photoWebPath = url;
    this.bookForm.controls['photo'].setValue('Cambiar foto');
  };

  async onSubmit() {
    if (this.bookData) {
      this.onUpdate();
      return;
    }
    this.onCreate();
  }

  async onDelete() {
    await this.alert.presentLoading();
    try {
      const docRef = this.fireStore.collection('books').doc(this.bookData.uid);
      await docRef.delete();
      this.alert.loading.dismiss();
      this.router.navigate(['books']);
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
    if (this.bookForm.status === 'INVALID') {
      await this.alert.present({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
    await this.alert.presentLoading();
    try {
      const { title, editorial, category, pickupAddress } = this.bookForm.value;
      const bookDoc = await this.fireStore
        .collection('books')
        .doc(this.bookData.uid);
      const currentUser = await this.fireAuth.currentUser;
      const book = await bookDoc.set({
        title,
        editorial,
        category,
        pickupAddress,
        owner: currentUser.uid,
        reserved: false,
      });
      if (this.photoBlob) {
        const storageRef = this.fireStorage.ref(`books/${this.bookData.uid}`);
        await storageRef.put(this.photoBlob);
      }
      await this.alert.loading.dismiss();
      this.router.navigate(['/books']);
    } catch (err) {
      await this.alert.loading.dismiss();
      this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  async onCreate() {
    if (this.bookForm.status === 'INVALID') {
      await this.alert.present({
        header: 'Error',
        message: 'Rellena el formulario correctamente',
        buttons: ['Ok'],
      });
      return;
    }
    await this.alert.presentLoading();
    try {
      const { title, editorial, category, pickupAddress } = this.bookForm.value;
      const bookRef = await this.fireStore.collection('books');
      const currentUser = await this.fireAuth.currentUser;
      const book = await bookRef.add({
        title,
        editorial,
        category,
        pickupAddress,
        owner: currentUser.uid,
        reserved: false,
      });
      const storageRef = this.fireStorage.ref(`books/${book.id}`);
      await storageRef.put(this.photoBlob);
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Registrado',
        message: 'Libro registrado correctamente',
        buttons: ['Ok'],
      });
      this.router.navigate(['/books']);
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
