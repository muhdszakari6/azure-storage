import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AzureBlobStorageService } from './azure-blob-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'practice';
  sas = "sp=racwdl&st=2021-08-09T08:38:43Z&se=2023-09-01T16:38:43Z&spr=https&sv=2020-08-04&sr=c&sig=48EuovbNKFAGyKef6jFX9TopBmAnPjghMHyY6cpsMRw%3D"
  imageList: string[] = [];
  file: any = null;
  loading: boolean = false
  form = new FormGroup({
    file: new FormControl(''),
  })

  constructor(
    private blobService: AzureBlobStorageService,
    private fb: FormBuilder
  ){

    this.form = this.fb.group({
      file: ['', [Validators.required]]
    })

  }

  ngOnInit() {
    this.reloadImageList(); 
  }

  onSubmit() {
    this.blobService.uploadImage(
      this.sas,
      this.file,
      this.file?.name,
      this.uploadImageHandler

    )
  }

  imageSelected(event: any){
    console.log(event.target.files[0])
    this.file = event.target.files[0]
  }

  openDownloadedImage(blob: Blob){

    let url = window.URL.createObjectURL(blob)   
    window.open(url) 

  }

  deleteImageSuccessful = (name: string) => {
    this.reloadImageList()
  }
  uploadImageHandler = () => {
    this.reloadImageList()
  }


  deleteImage(name:string){

    this.blobService.deleteImage(this.sas,name,this.deleteImageSuccessful)
  }

  // public uploadImage(sas: string, content:Blob, name: string, handler:()=>void){



  private reloadImageList(){
    this.loading = true
    this.blobService.listImages().then(
      (list) => {
        this.loading = false
        this.imageList = list
      }
    )
  }

  public downloadImage(name: string){ 
    this.blobService.downloadImage(name,this.openDownloadedImage);
  }

}
