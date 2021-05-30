import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  @ViewChild('video', { static: true })
  video: ElementRef<HTMLVideoElement>;

  title = 'online-meeting';
  options: MediaStreamConstraints = { video: true, audio: true };

  recorder;
  sourceBuffer = null;
  blobs = [];

  constructor(
    private socketService: SocketService
  ) { }

  async ngOnInit(): Promise<void> {
    this.socketService.update().subscribe((evt) => {
      const event = evt as any;
      
      const users = Object.keys(event.users);

      for (const user of users) {
        this.createVideo(user);
      }
    });

    this.socketService.userDisconnected().subscribe(id => {
      const video = document.getElementById(id as any).remove();
    });

    this.socketService.join('gustavo');

    await this.recordConfigs();
  }

  createVideo(id, url?): HTMLVideoElement {
    if (document.getElementById(id)) {
      return;
    }

    const newVideo = document.createElement('video');
    
    const addedVideo = document.getElementById('app-container').appendChild(newVideo);
    addedVideo.setAttribute('id', id);
    addedVideo.setAttribute('preload', 'auto');
    
    if (url) {
      newVideo.src = url;
    }
    
    newVideo.load();
    newVideo.play();
    return addedVideo;

  }

  async recordConfigs() {
    const stream = await navigator.mediaDevices.getUserMedia(this.options);

    this.video.nativeElement.srcObject = stream;
    this.video.nativeElement.muted = true;

    this.recorder = new MediaRecorder(stream);

    this.recorder.ondataavailable = event => {
      this.blobs.push(event.data);
    }

    this.recorder.onstop = event => {
      this.socketService.sendBlob(this.blobs);

      this.blobs = [];
    }

    setInterval(() => {
      this.recorder.stop();

      this.recorder.start();
    }, 1000);

    this.socketService.getBlob().subscribe(data => {
      const id = data.id;
      const blob = new Blob(data.blob);

      const toRemove = document.getElementById(id)

      if (toRemove) {
        toRemove.remove();
      }

      const url = window.URL.createObjectURL(blob);

      this.createVideo(id, url);
    });

    this.recorder.start();
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}

declare var MediaRecorder: any;
