import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements extends AFrameElements, ModelViewerElements {}
  }
}

// React 19 compatibility
declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends AFrameElements, ModelViewerElements {}
  }
}

interface ModelViewerElements {
  "model-viewer": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean;
      "ar-modes"?: string;
      "ar-scale"?: string;
      "ar-placement"?: string;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      "shadow-intensity"?: string;
      "environment-image"?: string;
      exposure?: string;
      loading?: string;
      reveal?: string;
      poster?: string;
      "interaction-prompt"?: string;
      "shadow-softness"?: string;
    },
    HTMLElement
  >;
}

interface AFrameElements {
  "a-scene": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
    HTMLElement
  >;
  "a-assets": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
  "a-entity": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
    HTMLElement
  >;
  "a-camera": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
    HTMLElement
  >;
  "a-asset-item": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
    HTMLElement
  >;
  "a-gltf-model": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
    HTMLElement
  >;
}

export {};
