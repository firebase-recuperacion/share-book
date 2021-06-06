import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
})
export class BooksPage {
  constructor(
    private fireStore: AngularFirestore,
    private fireStorage: AngularFireStorage,
    private fireAuth: AngularFireAuth,
    public alert: AlertService,
    private router: Router
  ) {}

  segment: string = 'books';

  segmentChanged({ detail: { value } }) {
    this.segment = value;
    this.getUserBooks(value);
  }

  currentUser: any;
  books$: BehaviorSubject<Array<any> | boolean> = new BehaviorSubject(false);

  async ionViewDidEnter() {
    this.currentUser = await this.fireAuth.currentUser;
    this.getUserBooks(this.segment);
  }

  async getUserBooks(segment: string) {
    this.books$.next(false);
    await this.alert.presentLoading();
    const booksRef = this.fireStore.collection('books', (ref) => {
      if (segment === 'books') {
        return ref.where('owner', '==', this.currentUser.uid);
      } else if (segment === 'reservations') {
        return ref.where('reserved', '==', this.currentUser.uid);
      }
    });
    const result = [];
    try {
      const { docs } = await booksRef.get().toPromise();
      await this.alert.loading.dismiss();
      for await (let doc of docs) {
        const storageRef = this.fireStorage.ref(`books/${doc.id}`);
        const photoObservable = await storageRef.getDownloadURL();
        const photoUrl = await photoObservable.toPromise();
        const data: any = doc.data();
        let reservedName = null;
        if (data.reserved !== false) {
          const reservedUserRef = await this.fireStore
            .collection('users')
            .doc(data.reserved);
          let reservedUser: any = (await reservedUserRef.get()).toPromise();
          reservedUser = (await reservedUser).data();
          reservedName = reservedUser.name;
        }
        result.push({ ...data, photo: photoUrl, uid: doc.id, reservedName });
      }
      this.books$.next(result);
      setTimeout(async () => {
        await this.alert.loading.dismiss();
      }, 200);
    } catch (err) {
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  async deleteReservation(book) {
    await this.alert.presentLoading();
    try {
      const bookRef = this.fireStore.collection('books').doc(book.uid);
      await bookRef.update({
        reserved: false,
      });
      await this.alert.loading.dismiss();
      this.router.navigate(['list']);
    } catch (err) {
      await this.alert.loading.dismiss();
      await this.alert.present({
        header: 'Error',
        message: err.message,
        buttons: ['Ok'],
      });
    }
  }

  openBookDetail(book) {
    let navigationExtras: NavigationExtras = {
      state: {
        book,
      },
    };
    this.router.navigate(['book'], navigationExtras);
  }

  openRegisterBook() {
    let navigationExtras: NavigationExtras = {
      state: {
        type: 'new',
      },
    };
    this.router.navigate(['book'], navigationExtras);
  }
}
