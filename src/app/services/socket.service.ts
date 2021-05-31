import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {}

  disconnect() {
    this.socket.emit('disconnect');
  }

  joined() {
    return this.socket.fromEvent('joined');
  }

  sendBlob(blob: any) {
    this.socket.emit('send', blob);
  }

  getBlob(): Observable<any> {
    return this.socket.fromEvent('blob');
  }

  join(name: string) {
    this.socket.emit('join', name);
  }

  update() {
    return this.socket.fromEvent('update');
  }

  userDisconnected() {
    return this.socket.fromEvent('user_disconnected');
  }
}
