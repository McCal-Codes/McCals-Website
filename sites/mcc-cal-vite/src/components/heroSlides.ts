import { imageUrl } from './portfolio/useManifest';

export interface HeroFocalPoint {
  x: number;
  y: number;
}

export interface HeroSlideVariant {
  image: string;
  alt: string;
  focalPointMobile?: HeroFocalPoint;
  focalPointDesktop?: HeroFocalPoint;
}

export interface HeroSlide extends HeroSlideVariant {
  title: string;
  meta: string;
  href: string;
  links?: {
    url: string;
    label?: string;
    cta?: string;
  }[];
  cta: string;
}

export interface HeroSeoImage {
  title: string;
  href: string;
  image: string;
  alt: string;
}

export const FAVORITE_HERO_SLIDES: HeroSlide[] = [
  {
    title: 'Politics',
    meta: 'Politics',
    image: imageUrl.journalism(
      'Politics/obama-speaks-pitt',
      '101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
    ),
    href: '/journalism',
    links: [
      { url: '/journalism', label: 'Journalism' },
      { url: '/featured-work', label: 'Featured Work' },
    ],
    cta: 'Politics',
    alt: 'Former President Barack Obama speaks to supporters at a campaign rally in Pittsburgh.',
    focalPointMobile: { x: 0.5, y: 0.42 },
    focalPointDesktop: { x: 0.5, y: 0.44 },
  },
  {
    title: 'Journalism',
    meta: 'Journalism',
    image: imageUrl.journalism(
      'Documentary/Boyd Station',
      '6-10-25_Caleb McCartney_320-min.jpg',
    ),
    href: '/journalism',
    links: [
      { url: '/journalism', label: 'Journalism' },
      { url: '/events', label: 'Event Coverage' },
    ],
    cta: 'Journalism',
    alt: 'A farmer works in a garden during a Boyd Station photojournalism assignment.',
    focalPointMobile: { x: 0.54, y: 0.38 },
    focalPointDesktop: { x: 0.46, y: 0.5 },
  },
  {
    title: 'Pittsburgh',
    meta: 'Pittsburgh',
    image: imageUrl.nature('Landscapes/Downtown Pittsburgh', 'IMGP7209.jpg'),
    href: '/nature',
    links: [
      { url: '/nature', label: 'Nature' },
      { url: '/featured-work', label: 'Featured Work' },
    ],
    cta: 'Pittsburgh',
    alt: 'A large, steel truss bridge spans over a body of water at sunset, with trees and buildings visible below and in the background.',
    focalPointMobile: { x: 0.6175632360483595, y: 0.464 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Portraits',
    meta: 'Portraits',
    image: imageUrl.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'),
    href: '/portraits',
    links: [
      { url: '/portraits', label: 'Portraits' },
      { url: '/portraits', label: 'Portrait Gallery' },
    ],
    cta: 'Portraits',
    alt: 'Studio portrait of Logan Spiker.',
    focalPointMobile: { x: 0.52, y: 0.42 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Corporate',
    meta: 'Corporate',
    image: imageUrl.event(
      'src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Corporate Work' },
    ],
    cta: 'Corporate',
    alt: 'Group of people at a professional networking event, talking and laughing, with a woman preparing drinks on a table.',
    focalPointMobile: { x: 0.8141660064306552, y: 0.528 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
  {
    title: 'Event',
    meta: 'Event',
    image: imageUrl.event(
      'src/images/Portfolios/Events/Howl at the Moon/251024 Howl at the Moon _CAL7841_webuse.webp',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Event Gallery' },
    ],
    cta: 'Event',
    alt: 'Guests sing along under bright club lights during a Howl at the Moon event.',
    focalPointMobile: { x: 0.44, y: 0.4 },
    focalPointDesktop: { x: 0.5, y: 0.46 },
  },
  {
    title: 'Concert',
    meta: 'Concert',
    image: '/images/homepage/concert/heading-north-bottle-rocket-cal11.webp',
    href: '/concerts',
    links: [
      { url: '/concerts', label: 'Concerts' },
      { url: '/concerts', label: 'Concert Gallery' },
    ],
    cta: 'Concert',
    alt: 'A Heading North vocalist sings into a microphone under red and blue lights at Bottle Rocket.',
    focalPointMobile: { x: 0.52, y: 0.36 },
    focalPointDesktop: { x: 0.48, y: 0.38 },
  },
  {
    title: 'Theatre',
    meta: 'Theatre',
    image: imageUrl.event(
      'src/images/Portfolios/Events/Growing Up/_CAL5543.jpg',
    ),
    href: '/events',
    links: [
      { url: '/events', label: 'Events' },
      { url: '/events', label: 'Theatre Gallery' },
    ],
    cta: 'Theatre',
    alt: 'Performers stand in line under saturated stage lighting during Growing Up.',
    focalPointMobile: { x: 0.6, y: 0.4 },
    focalPointDesktop: { x: 0.6, y: 0.44 },
  },
  {
    title: 'Nature',
    meta: 'Nature',
    image: imageUrl.nature('Flowers & Plants', 'IMGP8504.jpg'),
    href: '/nature',
    links: [
      { url: '/nature', label: 'Nature' },
      { url: '/nature', label: 'Nature Gallery' },
    ],
    cta: 'Nature',
    alt: 'Close-up of a pink flower with a dark green background.',
    focalPointMobile: { x: 0.5, y: 0.5 },
    focalPointDesktop: { x: 0.5, y: 0.5 },
  },
];

export const HERO_IMAGE_VARIANTS: Record<string, HeroSlideVariant[]> = {
  Politics: [
    {
      image: imageUrl.journalism(
        'Politics/clinton-pitt-greensburgh',
        '241029_clinton-pitt_CAL3063.jpg',
      ),
      alt: 'Former President Bill Clinton greets supporters at a campaign event in Greensburg, Pennsylvania.',
      focalPointMobile: { x: 0.48, y: 0.34 },
      focalPointDesktop: { x: 0.46, y: 0.42 },
    },
    {
      image: imageUrl.journalism('Politics/kamala-pittsburgh', '241104_kamala-pgh-eve_CAL4102.jpg'),
      alt: 'Kamala Harris speaks at a campaign event in Pittsburgh.',
      focalPointMobile: { x: 0.5, y: 0.54 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.journalism('Politics/kamala-speaks-erie', '141024_Kamala Speaks at Erie_CAL4115.jpg'),
      alt: 'Kamala Harris speaks at a campaign event in Erie, Pennsylvania.',
      focalPointMobile: { x: 0.54, y: 0.52 },
      focalPointDesktop: { x: 0.68, y: 0.5 },
    },
    {
      image: imageUrl.journalism(
        'Politics/trump-returns-butler',
        '051024 Caleb McCartney_Trump Returns to Butler PA_CAL2649.webp',
      ),
      alt: 'Donald Trump returns to Butler, Pennsylvania for a campaign rally.',
      focalPointMobile: { x: 0.48, y: 0.66 },
      focalPointDesktop: { x: 0.5, y: 0.56 },
    },
    {
      image: imageUrl.journalism(
        'Politics/jdvance-johnstown',
        '241012_JD Vance in Johnstown_CAL3636.webp',
      ),
      alt: 'Supporters raise their hands as JD Vance speaks at a campaign event in Johnstown, Pennsylvania.',
      focalPointMobile: { x: 0.52, y: 0.42 },
      focalPointDesktop: { x: 0.54, y: 0.44 },
    },
  ],
  Journalism: [
    {
      image: imageUrl.journalism(
        'Documentary/Boyd Station',
        '6-10-25_Caleb McCartney_320-min.jpg',
      ),
      alt: 'A farmer works in a garden during a Boyd Station photojournalism assignment.',
      focalPointMobile: { x: 0.54, y: 0.38 },
      focalPointDesktop: { x: 0.46, y: 0.5 },
    },
    {
      image: '/images/homepage/journalism/cmu-trump-protest-cal1489.webp',
      alt: 'Pittsburgh police officers stand near demonstrators and an Indivisible Pittsburgh banner during a CMU Trump protest.',
      focalPointMobile: { x: 0.7, y: 0.46 },
      focalPointDesktop: { x: 0.66, y: 0.48 },
    },
    {
      image: '/images/homepage/journalism/cmu-trump-protest-cal1573.webp',
      alt: 'A masked demonstrator stands in front of Pittsburgh police officers in riot helmets during a CMU Trump protest.',
      focalPointMobile: { x: 0.72, y: 0.42 },
      focalPointDesktop: { x: 0.7, y: 0.44 },
    },
    {
      image: '/images/homepage/journalism/cmu-trump-protest-cal1448.webp',
      alt: 'A demonstrator stands in the street as Pittsburgh police officers move toward protesters during a CMU Trump protest.',
      focalPointMobile: { x: 0.4, y: 0.5 },
      focalPointDesktop: { x: 0.48, y: 0.5 },
    },
    {
      image: '/images/homepage/journalism/cmu-trump-protest-cal1498.webp',
      alt: 'A Pittsburgh police officer in riot gear holds a baton under a bright sky during a CMU Trump protest.',
      focalPointMobile: { x: 0.47, y: 0.36 },
      focalPointDesktop: { x: 0.48, y: 0.42 },
    },
    {
      image: imageUrl.journalism(
        'Events/Pro Palestine Protest at Pitt',
        '240430_Pro Palestine Protest at Pitt_CAL1489_webuse.jpg',
      ),
      alt: 'A demonstrator sits wrapped in a Palestinian flag during a Pitt protest.',
      focalPointMobile: { x: 0.58, y: 0.42 },
      focalPointDesktop: { x: 0.58, y: 0.5 },
    },
    {
      image: imageUrl.journalism(
        'Events/Pro Palestine Protest at Pitt',
        '240430_Pro Palestine Protest at Pitt_CAL1501_webuse.jpg',
      ),
      alt: 'Demonstrators gather during a pro-Palestine protest at Pitt.',
      focalPointMobile: { x: 0.68, y: 0.42 },
      focalPointDesktop: { x: 0.58, y: 0.5 },
    },
  ],
  Pittsburgh: [
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '211028_Pittsburgh_Sunset_IMGP7702.jpg'),
      alt: 'Clouds gather over Pittsburgh\'s riverfront at sunset.',
      focalPointMobile: { x: 0.5, y: 0.58 },
      focalPointDesktop: { x: 0.5, y: 0.62 },
    },
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '211028_Downtown_Fire_Escape_IMGP7594.jpg'),
      alt: 'A fire escape climbs a weathered brick building in Downtown Pittsburgh.',
      focalPointMobile: { x: 0.54, y: 0.58 },
      focalPointDesktop: { x: 0.58, y: 0.56 },
    },
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '200805_Riverfront_Golden_Hour_DSC02724_1.jpg'),
      alt: 'Backlit grass glows in evening light in Pittsburgh.',
      focalPointMobile: { x: 0.6, y: 0.48 },
      focalPointDesktop: { x: 0.56, y: 0.44 },
    },
    {
      image: '/images/homepage/pittsburgh/downtown-sunset-imgp8595.webp',
      alt: 'Downtown Pittsburgh buildings frame an orange sunset over Wood Street.',
      focalPointMobile: { x: 0.5, y: 0.5 },
      focalPointDesktop: { x: 0.5, y: 0.36 },
    },
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '230509_untitled__CAL4122.jpg'),
      alt: 'A downtown Pittsburgh cityscape at dusk.',
      focalPointMobile: { x: 0.5, y: 0.52 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/Downtown Pittsburgh', '230505_untitled__CAL4020-Edit.jpg'),
      alt: 'Downtown Pittsburgh architecture and city lights.',
      focalPointMobile: { x: 0.5, y: 0.5 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Portraits: [
    {
      image: imageUrl.portrait('Studio/Logan Spiker', 'Studio with logan0066.jpg'),
      alt: 'Studio portrait of Logan Spiker.',
      focalPointMobile: { x: 0.52, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.portrait('Studio/Liam Sulivan', '250425_Excused Chao’s with Liam _CAL3563-min.jpg'),
      alt: 'Studio portrait of Liam Sulivan.',
      focalPointMobile: { x: 0.52, y: 0.38 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.portrait('Studio/Helen Wise', '240528_Helen Wise_1639_CAL_Compressed.jpg'),
      alt: 'Studio portrait of Helen Wise.',
      focalPointMobile: { x: 0.48, y: 0.36 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Corporate: [
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/The Rooney Rule/250417 The Rooney Rule_CAL2761.jpg',
      ),
      alt: 'Professionals speak during a Rooney Rule event.',
      focalPointMobile: { x: 0.45, y: 0.44 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7937_webuse.jpg',
      ),
      alt: 'A speaker presents during the PRSSA workplace inclusivity event.',
      focalPointMobile: { x: 0.64, y: 0.44 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/Inclusivity Event - PRSSA/251025 PRSSA Workplace Inclusivity_CAL7956_webuse.jpg',
      ),
      alt: 'Panelists speak during the PRSSA workplace inclusivity event.',
      focalPointMobile: { x: 0.5, y: 0.46 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
  Event: [
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/Myron Cope Awards 2024/240602_Point Park Cope Awards 2024 _1657_CAL_2048px.jpg',
      ),
      alt: 'Audience members laugh together during the Myron Cope Awards 2024.',
      focalPointMobile: { x: 0.56, y: 0.42 },
      focalPointDesktop: { x: 0.58, y: 0.45 },
    },
    {
      image: imageUrl.event(
        'src/images/Portfolios/Events/pitt-winter-grad-2024/241218_pitt-grad-w24_CAL7317.jpg',
      ),
      alt: 'A Pitt graduate smiles during winter commencement.',
      focalPointMobile: { x: 0.52, y: 0.4 },
      focalPointDesktop: { x: 0.54, y: 0.44 },
    },
  ],
  Concert: [
    {
      image: '/images/homepage/concert/haven-block-party-cal3301.webp',
      alt: 'A Casino Six vocalist wearing sunglasses stands at a microphone under warm lights during Haven Block Party.',
      focalPointMobile: { x: 0.52, y: 0.34 },
      focalPointDesktop: { x: 0.52, y: 0.36 },
    },
    {
      image: '/images/homepage/concert/bellevue-music-festival-cal6319.webp',
      alt: 'Brahctopus performs on an outdoor stage for a crowd at Bellevue Music Festival.',
      focalPointMobile: { x: 0.52, y: 0.5 },
      focalPointDesktop: { x: 0.54, y: 0.5 },
    },
    {
      image: '/images/homepage/concert/when-we-were-dead-cal8515.webp',
      alt: 'A Dream The Heavy guitarist plays through pink stage smoke during When We Were Dead.',
      focalPointMobile: { x: 0.48, y: 0.36 },
      focalPointDesktop: { x: 0.5, y: 0.38 },
    },
    {
      image: imageUrl.concert(
        'Concert/Heading North/November 2025',
        '251101 Headed North - Bottle Rocket_CAL21_webuse.jpg',
      ),
      alt: 'Heading North performs with the full band under magenta and blue lights.',
      focalPointMobile: { x: 0.56, y: 0.34 },
      focalPointDesktop: { x: 0.52, y: 0.42 },
    },
    {
      image: imageUrl.concert(
        'Concert/Heading North/November 2025',
        '251101 Headed North - Bottle Rocket_CAL9618_webuse.jpg',
      ),
      alt: 'The Heading North vocalist sings into the mic during a black-and-white close-up.',
      focalPointMobile: { x: 0.58, y: 0.32 },
      focalPointDesktop: { x: 0.54, y: 0.4 },
    },
    {
      image: imageUrl.concert(
        'Concert/Heading North/November 2025',
        '251101 Headed North - Bottle Rocket_CAL9742_webuse.jpg',
      ),
      alt: 'The Heading North vocalist sings in a close-up washed in red and blue light.',
      focalPointMobile: { x: 0.58, y: 0.34 },
      focalPointDesktop: { x: 0.56, y: 0.4 },
    },
  ],
  Theatre: [
    {
      image: imageUrl.event('src/images/Portfolios/Events/Growing Up/_CAL5514.jpg'),
      alt: 'A glowing lamp and teddy bear sit on the Growing Up stage set.',
      focalPointMobile: { x: 0.5, y: 0.42 },
      focalPointDesktop: { x: 0.42, y: 0.46 },
    },
  ],
  Nature: [
    {
      image: imageUrl.nature('Wildlife/Birds/Blue-bellied roller', '230727_Blue-bellied Roller__CAL4526.jpg'),
      alt: 'A blue-bellied roller perched on a branch.',
      focalPointMobile: { x: 0.54, y: 0.42 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/West Virginia', 'seneca-rocks-night.jpg'),
      alt: 'Seneca Rocks under a night sky.',
      focalPointMobile: { x: 0.52, y: 0.46 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
    {
      image: imageUrl.nature('Landscapes/West Virginia', 'barn.jpg'),
      alt: 'A rural West Virginia barn in a mountain landscape.',
      focalPointMobile: { x: 0.48, y: 0.5 },
      focalPointDesktop: { x: 0.5, y: 0.5 },
    },
  ],
};

export const HOMEPAGE_HERO_SOCIAL_IMAGE =
  FAVORITE_HERO_SLIDES.find((slide) => slide.title === 'Concert') ?? FAVORITE_HERO_SLIDES[0];

export const HOMEPAGE_HERO_IMAGE_SEO_ENTRIES: HeroSeoImage[] = (() => {
  const seen = new Set<string>();
  const images: HeroSeoImage[] = [];

  for (const slide of FAVORITE_HERO_SLIDES) {
    const variants = [
      {
        image: slide.image,
        alt: slide.alt,
      },
      ...(HERO_IMAGE_VARIANTS[slide.cta] ?? []),
    ];

    for (const variant of variants) {
      if (seen.has(variant.image)) {
        continue;
      }

      seen.add(variant.image);
      images.push({
        title: slide.title,
        href: slide.href,
        image: variant.image,
        alt: variant.alt,
      });
    }
  }

  return images;
})();
