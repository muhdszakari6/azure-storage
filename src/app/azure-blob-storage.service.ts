import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class AzureBlobStorageService {

  accountName = "salimzak"
  containerName = "pictures"

  constructor() {
   }

  //A method to create a container client 
  //it returns a container client that other methods can use for async operations 
  private containerClient(sas?: string): ContainerClient {
    let token = ""
    if(sas){
      token = sas
    }
    //Created a blob service client by providing storage account name and url 
    return new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net?${token}`)
      .getContainerClient(this.containerName)
  }

  //aync method to return a Promise of type string []
  public async listImages(): Promise<string[]> {
    let result: string[] = []
    //The listBlobsFlat returns an async iteratable iterator 
    //an async iteratable iterator allow you iterate async operations 
    let blobs = this.containerClient().listBlobsFlat()

    //This is a clean way to iterate over async operations 
    //without having to call the next() method on each on the iterator 
    for await (const blob of blobs) {
      result.push(blob.name)
    }
    return result

  }

  //A method to download the blods
  //Accepts the name of the image to be downloaded
  //and a callback function named "handler" to call when the
  //download is complete 
  public downloadImage(name: string, handler: (blob: Blob) => void) {

    //Create a blob client 
    const blobClient = this.containerClient().getBlobClient(name);

    //download returns a promise that also returns another promise 
    //hence the double .then blocks 
    blobClient.download().then(
      (res) => {
        res.blobBody?.then(blob => {
          handler(blob)
        })
      }
    )

  }

  //Delete Image 
  public deleteImage(sas: string, name: string, handler: (name:string)=> void){
    this.containerClient(sas).deleteBlob(name).then(
      ()=>{
        handler(name)
      }
    )
  }

  public uploadImage(sas: string, content:Blob, name: string, handler:()=>void){
    const blockBlobClient = this.containerClient(sas).getBlockBlobClient(name);
    blockBlobClient.uploadData(content, {blobHTTPHeaders:{blobContentType: content.type}})
    .then(()=>handler())
  }



}

