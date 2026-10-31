// Work samples shown at /work-samples. Captions follow AP style.
export interface WorkSampleImage {
  src: string;
  width: number;
  height: number;
  caption: string;
  credit: string;
}
export interface WorkSampleSection {
  id: string;
  title: string;
  short: string;
  blurb: string;
  layout: 'stack' | 'grid';
  cover: number;
  items: WorkSampleImage[];
}

export const workSampleSections: WorkSampleSection[] = [
  {
    "id": "news",
    "title": "News and Politics",
    "short": "News",
    "blurb": "The 2024 campaign trail and protests in Pennsylvania.",
    "layout": "grid",
    "cover": 10,
    "items": [
      {
        "src": "/images/work-samples/news-01.jpg",
        "width": 1800,
        "height": 1440,
        "caption": "A demonstrator holds a sign critical of Vice President Kamala Harris in front of the Cathedral of Learning during a pro-Palestinian protest at the University of Pittsburgh on Sept. 25, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-02.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "A woman leads chants through a megaphone during a pro-Palestinian protest at the University of Pittsburgh on Sept. 25, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-03.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Pittsburgh police officers in riot gear watch as demonstrators carrying an Indivisible Pittsburgh banner march near Carnegie Mellon University during a protest tied to the Energy and Innovation Summit in Pittsburgh on July 15, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-04.jpg",
        "width": 1080,
        "height": 720,
        "caption": "Vice President Kamala Harris applauds in front of an \"Erie\" screen during a campaign rally at Erie Insurance Arena in Erie on Oct. 14, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-05.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "Supporters hold \"Trump Vance\" signs during a rally by former President Donald Trump at the Butler Farm Show grounds in Butler Township on Oct. 5, 2024, his first return to the site of the July 13 assassination attempt.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-06.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "Supporters hold letters spelling \"VOTE\" during a rally for Vice President Kamala Harris with former President Barack Obama at Fitzgerald Field House at the University of Pittsburgh on Oct. 10, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-07.jpg",
        "width": 1201,
        "height": 1800,
        "caption": "A veteran wearing a VFW cap and red blazer smiles while waiting for Vice President Kamala Harris at the John Murtha Johnstown-Cambria County Airport in Johnstown on Sept. 13, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-08.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Former President Bill Clinton greets supporters at a campaign event for Vice President Kamala Harris at the University of Pittsburgh at Greensburg on Oct. 29, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-09.jpg",
        "width": 1080,
        "height": 720,
        "caption": "Supporters raise their hands as Republican vice presidential nominee JD Vance speaks during a rally at JWF Industries in Johnstown on Oct. 12, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-10.jpg",
        "width": 1197,
        "height": 1800,
        "caption": "A child holds a handmade sign in the crowd as Vice President Kamala Harris speaks at a rally with musical guests at the Carrie Blast Furnaces in Rankin on election eve, Nov. 4, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-11.jpg",
        "width": 1080,
        "height": 720,
        "caption": "Former President Barack Obama reaches toward supporters at a rally for Vice President Kamala Harris at Fitzgerald Field House at the University of Pittsburgh on Oct. 10, 2024.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/news-12.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "Supporters cheer during a campaign rally for Vice President Kamala Harris at Erie Insurance Arena in Erie on Oct. 14, 2024.",
        "credit": "Photo by Caleb McCartney"
      }
    ]
  },
  {
    "id": "spot",
    "title": "Spot News",
    "short": "Spot news",
    "blurb": "Flooding at a Point Park University building in January 2025 and a downed tree in Avalon in June 2026.",
    "layout": "grid",
    "cover": 0,
    "items": [
      {
        "src": "/images/work-samples/spot-01.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Standing water and mud cover the floor of a basement mechanical room beneath the Career Center at Point Park University in Pittsburgh on Jan. 26, 2025.",
        "credit": "Photo by Caleb McCartney for The Globe"
      },
      {
        "src": "/images/work-samples/spot-02.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Air movers and a dehumidifier run across the Career Center at Point Park University in Pittsburgh on Jan. 26, 2025, as crews work to dry the building after flooding.",
        "credit": "Photo by Caleb McCartney for The Globe"
      },
      {
        "src": "/images/work-samples/spot-03.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "Avalon firefighters, including Capt. D. Cooper, and a community member identified as TJ, work to clear a downed tree from Spruce Run Road on Sunday, June 14, 2026, near North Birmingham Avenue in Avalon, Pa.",
        "credit": "Photo by Caleb McCartney for Front Porch Press"
      }
    ]
  },
  {
    "id": "people",
    "title": "People and Features",
    "short": "Features",
    "blurb": "Faith, school, culture and community, 2025 to 2026.",
    "layout": "grid",
    "cover": 1,
    "items": [
      {
        "src": "/images/work-samples/people-01.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Maria Paula de Araújo Guedes (6) hugging Stitch plush alongside her family at the Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-02.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Hannah Loughman, pastor, embraces Maria’s mother with a hug at the Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-03.jpg",
        "width": 1198,
        "height": 1800,
        "caption": "Shelley Wygant, left, and Jeffrey Wygant pose for a portrait with a framed photo of the Sewickley Bridge under construction at their home on Orris Road on Tuesday, May 19, 2026, in Sewickley. The photo shows the bridge before its final span was put in place.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-04.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A Quaker Valley High School homecoming queen is embraced after being crowned at halftime of a football game at Chuck Knox Stadium in Leetsdale on Oct. 2, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-05.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Dolores de Jong, mother of Sewickley Academy student Victoria de Jong, washes the legs of a bay horse in the wash stall at Barberry Farm in Sewickley on Wednesday, Oct. 28, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-06.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A Sewickley Academy graduate poses with his parents outside the school after commencement in Sewickley on June 5, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/people-07.jpg",
        "width": 1080,
        "height": 719,
        "caption": "A patron tips a performer during a drag show at Carnegie Coffee on March 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/people-08.jpg",
        "width": 1080,
        "height": 719,
        "caption": "A performer in a suit and red tie raises both arms as the audience watches during a drag show at Carnegie Coffee on March 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      }
    ]
  },
  {
    "id": "civic",
    "title": "Civic and Public Affairs",
    "short": "Civic",
    "blurb": "Sidewalks, local government and public events, 2025 to 2026.",
    "layout": "grid",
    "cover": 6,
    "items": [
      {
        "src": "/images/work-samples/civic-01.jpg",
        "width": 1800,
        "height": 1197,
        "caption": "A \"sidewalk closed\" sign and traffic cones block a sidewalk in Hazelwood on May 2, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/civic-02.jpg",
        "width": 1800,
        "height": 1197,
        "caption": "A cracked, overgrown sidewalk runs along a street in Hazelwood on May 2, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/civic-03.jpg",
        "width": 1197,
        "height": 1800,
        "caption": "Window lettering at the Downtown YWCA building in Pittsburgh reads \"eliminating racism, empowering women\" on May 2, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/civic-04.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A pedestrian walks along Hegner Way between businesses Tuesday, June 23, 2026, in Sewickley.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/civic-05.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A vehicle sits along the newly reconstructed Washington Street on April 7, 2026, in Leetsdale, Pa.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/civic-06.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Leetsdale Councilman Robert Benedict speaks while standing along Washington Street on April 7, 2026, in Leetsdale, Pa.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/civic-07.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A veteran stands with the POW/MIA flag during the dedication of the Leet Township Veterans Memorial at the Leet Township Municipal Complex in Fair Oaks on Saturday, July 25, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/civic-08.jpg",
        "width": 1800,
        "height": 1800,
        "caption": "A Leetsdale firefighter stands in dress uniform during the dedication of the Leet Township Veterans Memorial at the Leet Township Municipal Complex in Fair Oaks on Saturday, July 25, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/civic-09.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Ceremonial shovels await participants during a groundbreaking ceremony for Fern Hollow Nature Center's major renovation and expansion project on Tuesday, May 5, 2026, in Sewickley.",
        "credit": "Photo by Caleb McCartney for TribLive"
      }
    ]
  },
  {
    "id": "sports",
    "title": "Sports and Action",
    "short": "Sports",
    "blurb": "High school football, college volleyball and historical fencing.",
    "layout": "grid",
    "cover": 0,
    "items": [
      {
        "src": "/images/work-samples/sports-01.jpg",
        "width": 1201,
        "height": 1800,
        "caption": "A Point Park University player dunks during a men's basketball game against Fisher on Nov. 3, 2023.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/sports-02.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A Seneca Valley ball carrier looks for room as Norwin's Carson Miller (9) and Santino Brasco (44) close in in a football game Friday, Oct. 23, 2026, at Seneca Valley's NexTier Stadium.",
        "credit": "Photo by Caleb McCartney for the Butler Eagle"
      },
      {
        "src": "/images/work-samples/sports-03.jpg",
        "width": 1080,
        "height": 720,
        "caption": "A Brentwood High School ball carrier fights off a Springdale defender during a football game on Sept. 12, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/sports-04.jpg",
        "width": 1080,
        "height": 719,
        "caption": "A color guard member spins a flag during a halftime performance at a Brentwood football game on Sept. 12, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/sports-05.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Two fencers raise their swords in a clash during a historical fencing event hosted by Hilt and Helm on Jan. 20, 2026.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/sports-06.jpg",
        "width": 1800,
        "height": 1286,
        "caption": "Point Park players go up for a block at the net during a women's volleyball match on Nov. 4, 2023.",
        "credit": "Photo by Caleb McCartney"
      }
    ]
  },
  {
    "id": "essay",
    "title": "Photo essay: Three Days With Boyd's Station",
    "short": "Boyd's Station",
    "blurb": "Cynthiana, Ky., June 2025. I spent a few days in Harrison County, Kentucky, with Boyd's Station, an arts and journalism project that invites photographers to document everyday life.",
    "layout": "stack",
    "cover": 3,
    "items": [
      {
        "src": "/images/work-samples/boyd-01.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Wildflowers bloom across a hillside meadow in Cynthiana, Ky., on June 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-02.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Photographer Jeff Swensen, left, and his son Michael Swensen tie fishing line beside a pond at dusk in Cynthiana, Ky., on June 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-03.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Two people stand on a gravel path overlooking a pasture where cattle graze in Cynthiana, Ky., on June 10, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-04.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Aldo Farmer's father tends vegetable seedlings at the family farm in Cynthiana, Ky., on June 10, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-05.jpg",
        "width": 1800,
        "height": 1200,
        "caption": "Aldo Farmer casts a fishing line into a pond at dusk on the family farm in Cynthiana, Ky., on June 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-06.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Aldo Farmer holds a sparkler as a parent looks on after dark at the family farm in Cynthiana, Ky., on June 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-07.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Aldo Farmer swings a lit sparkler at the family farm in Cynthiana, Ky., on June 9, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-08.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A shopkeeper stands among antiques and framed artwork inside a shop in Cynthiana, Ky., on June 10, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-09.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A man looks into the cab of a vintage truck as a woman sits in the passenger seat on a street in Cynthiana, Ky., on June 10, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-10.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A storefront window in Cynthiana, Ky., reads \"A beautiful place to be,\" on June 10, 2025.",
        "credit": "Photo by Caleb McCartney"
      },
      {
        "src": "/images/work-samples/boyd-11.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "A musician performs at the Aeolian Music Hall in Cynthiana, Ky., on June 12, 2025.",
        "credit": "Photo by Caleb McCartney"
      }
    ]
  },
  {
    "id": "healing",
    "title": "Photo essay: A Healing Service in Sewickley",
    "short": "Healing service",
    "blurb": "Sewickley, Pa., March 2026. Clergy, school staff and neighbors gathered at Sewickley United Methodist Church for a healing service for Maria Paula de Araujo Guedes, 6, and her family. Photographed for TribLive.",
    "layout": "stack",
    "cover": 3,
    "items": [
      {
        "src": "/images/work-samples/healing-01.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Members of the Sewickley community gather for a healing service for Maria Paula de Araújo Guedes at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-02.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Pastor Hannah Loughman speaks as a photo is projected on the screen behind her during a healing service at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-03.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Members of the Araújo Guedes family lead Maria to the steps at the front of Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-04.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Maria Paula de Araújo Guedes, 6, hugs a Stitch plush toy as Pastor Hannah Loughman speaks with her family during a healing service at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-05.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Pastor Hannah Loughman blesses Breno Araújo Guedes, 17, Maria's brother, during a healing service at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-06.jpg",
        "width": 1800,
        "height": 1197,
        "caption": "Pastor Hannah Loughman blesses Maria's mother during a healing service at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-07.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Colin McRoberts, chaplain of the Allegheny County Jail, Paul Leone, a retired Disciples of Christ pastor, and Hannah Loughman bless Maria Paula de Araújo Guedes and her family at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-08.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Pastor Hannah Loughman embraces Maria's mother during a healing service at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-09.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Leah Lindenfelser, Maria's school guidance counselor, reassures Maria and her family at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      },
      {
        "src": "/images/work-samples/healing-10.jpg",
        "width": 1800,
        "height": 1198,
        "caption": "Maria's mother sits in a pew at Sewickley United Methodist Church on March 27, 2026.",
        "credit": "Photo by Caleb McCartney for TribLive"
      }
    ]
  }
];
