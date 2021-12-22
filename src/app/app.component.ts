import {
  Component,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { Subject } from "rxjs";
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

  private documentLoaded$: Subject<void>;

  constructor() {
    this.documentLoaded$ = new Subject<void>();
  }

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
      const { documentViewer, Search, PDFNet, annotationManager } = instance.Core;
      this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);
      instance.UI.openElements(["notesPanel"]);

      await PDFNet.initialize(""
      );

      documentViewer.addEventListener("documentLoaded", async () => {
      const document = documentViewer.getDocument();
        const searchText = 'Eén voorgevulde pen bevat 70 mg erenumab.';
        const mode = Search.Mode.HIGHLIGHT;
        const searchOptions = {
          // If true, a search of the entire document will be performed. Otherwise, a single search will be performed.
          fullSearch: false,
          // The callback function that is called when the search returns a result.
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          onResult: (result: any) => {
            // with 'PAGE_STOP' mode, the callback is invoked after each page has been searched.
            if (result.resultCode === Search.ResultCode.FOUND) {
              const textQuad = result.quads; // getPoints will return Quad objects
          const xArray: any = [];
          const yArray: any = [];
          textQuad.forEach((tQ: any) => {
            const points = tQ.getPoints();
            xArray.push(points.x1, points.x2, points.x3, points.x4);
            yArray.push(points.y1, points.y2, points.y3, points.y4);
          });

          const annotation = new instance.Core.Annotations.RectangleAnnotation();
          const viewerCoords1 = document.getViewerCoordinates(1, Math.min(...xArray), Math.max(...yArray));
          const viewerCoords2 = document.getViewerCoordinates(1, Math.max(...xArray), Math.min(...yArray));

          
          const newRects = {
            x1: Math.min(...xArray),
            y1: Math.max(...yArray),
            x2: Math.max(...xArray),
            y2: Math.min(...yArray)
          } as any;

          // create annotation rects
          // const newRects = {
          //   x1: viewerCoords1.x,
          //   y1: viewerCoords1.y,
          //   x2: viewerCoords2.x,
          //   y2: viewerCoords2.y
          // } as any;
          // set annotation rects
          annotation.setRect(newRects);
          annotationManager.addAnnotations([annotation] as Core.Annotations.Annotation[]);
            }
          },
        };
        instance.Core.documentViewer.textSearchInit(
          searchText,
          mode,
          searchOptions
        );
      });
    });
  }
}
