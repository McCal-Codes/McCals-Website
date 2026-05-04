export type GalleryPlacement = {
  large?: boolean;
  centered?: boolean;
};

export type DisplayImage = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  sceneCaption: string;
  gallery: GalleryPlacement;
  field: {
    kicker: string;
    title: string;
    body: string[];
  };
};

export type TrailImage = {
  id: string;
  folderPath: string;
  filename: string;
  src?: string;
  width: number;
  height: number;
  alt: string;
  sceneCaption: string;
  gallery: { large?: boolean; centered?: boolean };
  field: {
    kicker: string;
    title: string;
    body: string[];
  };
};

export type ProseInlinePhotoProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};
