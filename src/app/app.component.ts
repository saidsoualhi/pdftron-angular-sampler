import {
  Component,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import WebViewer, { Core } from "@pdftron/webviewer";

export const pdfTronLibPath = "/assets/lib/";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements AfterViewInit {
  @ViewChild("viewer") viewer: ElementRef;
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();

  ngAfterViewInit(): void {
    WebViewer(
      {
        path: "../lib",
        initialDoc: "../files/webviewer-demo-annotated.pdf",
        css: "/assets/pdftron.css",
        fullAPI: true,
        licenseKey: ""
      },
      this.viewer.nativeElement
    ).then(async (instance) => {
      const { annotationManager } = instance.Core;
      this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);

    instance.UI.setLanguage('en');

      instance.UI.setTranslations('en', {
        key: 'annotation.rectangle',
        value: 'rectangle updated'
      });
  
      instance.UI.setTranslations('en', {
        key: 'annotation.polygon',
        value: 'polygon updated'
      });

      instance.Core.annotationManager.addEventListener(
        'annotationChanged',
        async (annotations: Core.Annotations.Annotation[], action: string) => {
          console.log('annotations: ', annotations);
          const xfdf = await annotationManager.exportAnnotations({
            annotList: annotations
          });
          console.log('xfd f====> : ', xfdf)
        }
      );
    });
  }
}

