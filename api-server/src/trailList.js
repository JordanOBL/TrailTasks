 const trails = await Trail.bulkCreate([
    {
      id: '92',
      trail_name: 'Old Faithful trail',
      trail_distance: '2.2',
      trail_lat: '44.4601',
      trail_long: '-110.8281',
      trail_difficulty: 'short',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/articles/images/19255d.jpg?maxwidth=1300&maxheight=1300&autorotate=false',
      trail_elevation: '0',
    },
    {
      id: '93',
      trail_name: 'Mount Washburn trail',
      trail_distance: '6.2',
      trail_lat: '44.8938',
      trail_long: '-110.4037',
      trail_difficulty: 'moderate',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/common/uploads/place/import/f3f0cc30-0062-4229-af63-db99985d9ab2_image_350.jpg',
      trail_elevation: '0',
    },
    {
      id: '94',
      trail_name: 'Fairy Falls trail',
      trail_distance: '8.3',
      trail_lat: '44.6677',
      trail_long: '-110.8656',
      trail_difficulty: 'moderate',
      park_id: '61',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/6E135C3B-1DD8-B71B-0B48ABBCAE1A44D6.jpg?width=1300&quality=90&mode=crop',
      trail_elevation: '0',
    },
    {
      id: '95',
      trail_name: 'Yosemite Falls trail',
      trail_distance: '7.2',
      trail_lat: '37.7459',
      trail_long: '-119.5965',
      trail_difficulty: 'moderate',
      park_id: '62',
      trail_image_url: 'https://www.nps.gov/yose/planyourvisit/index.htm',
      trail_elevation: '0',
    },
    {
      id: '96',
      trail_name: 'Half Dome trail',
      trail_distance: '14.2',
      trail_lat: '37.746',
      trail_long: '-119.5336',
      trail_difficulty: 'long',
      park_id: '62',
      trail_image_url:
        'https://www.myyosemitepark.com/wp-content/uploads/2021/12/YO-HalfDome-cables-trail_distance_Ordelheide_1500.jpg',
      trail_elevation: '0',
    },
    {
      id: '97',
      trail_name: 'Mist trail',
      trail_distance: '3',
      trail_lat: '37.7324',
      trail_long: '-119.5634',
      trail_difficulty: 'short',
      park_id: '62',
      trail_image_url:
        'https://www.yosemite.com/wp-content/uploads/2016/05/Vernal-Fall-at-Yosemite-Mariposa.jpg',
      trail_elevation: '0',
    },
    {
      id: '1',
      trail_name: 'The Beehive Loop Trail',
      trail_distance: '1.5',
      trail_lat: '44.333805',
      trail_long: '-68.188822',
      trail_difficulty: 'short',
      park_id: '1',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjE1NTUyOTYvODE4ZGJiMzQ5NjllOWU1ZGI5ZTE4ZjVjNjI0OGNlMjIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '508',
      all_trails_url:'https://www.alltrails.com/trail/us/maine/the-beehive-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/hike-beehive-loop.htm',
      hiking_project_url: null
    },
    {
      id: '2',
      trail_name: 'Jordan Pond Path',
      trail_distance: '3.3',
      trail_lat: '44.3276',
      trail_long: '-68.2978',
      trail_difficulty: 'short',
      park_id: '1',
      trail_image_url:
        'https://hikingproject.com/assets/photos/hike/7066444_medium_1579631798.jpg?cache=1686958647',
      trail_elevation: '0',
      all_trails_url:'https://www.alltrails.com/trail/us/maine/jordan-pond-path',
      nps_url: 'https://www.nps.gov/thingstodo/hike-jordan-pond-path.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007410/jordan-pond-path'
    },
    {
      id: '3',
      trail_name: 'Cadillac South Ridge Trail',
      trail_distance: '6.7',
      trail_lat: '44.3276',
      trail_long: '-68.2978',
      trail_difficulty: 'moderate',
      park_id: '1',
     // badge: 'Tallest Mountain on the East Coast 
      trail_image_url:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.travel-experience-live.com%2Fhiking-cadillac-mountain-maine%2F&psig=AOvVaw1hryp6NbJnZ5Sj1o71RLTN&ust=1687216177341000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCJiqkpn4zf8CFQAAAAAdAAAAABAJ',
      trail_elevation: '1530',
      all_trails_url: 'https://www.alltrails.com/trail/us/maine/cadillac-south-ridge-trail--2',
      nps_url: 'https://www.nps.gov/thingstodo/hike-cadillac-south-ridge-trail.htm',
      hiking_project_url:'https://www.hikingproject.com/trail/7007423/cadillac-south-ridge-trail'
    },
    {
      id: '4',
      trail_name: 'Lower Sauma Ridge Trail',
      trail_distance: '1.5',
      trail_lat: '-14.2462',
      trail_long: '-170.6858',
      trail_difficulty: 'short',
      park_id: '2',
      trail_image_url:
        'https://s3-media0.fl.yelpcdn.com/bphoto/toIXdbXHxbeZ2bVLCS_-Zg/348s.jpg',
      trail_elevation: '167',
      all_trails_url:'https://www.alltrails.com/trail/american-samoa/tutuila/lower-sauma-ridge-trail?u=i',
      nps_url: 'https://www.nps.gov/thingstodo/hike-lower-sauma-trail.htm',
      hiking_project_url: null
    },
    {
      id: '5',
      trail_name: 'Mount Alava Trail',
      trail_distance: '7.3',
      trail_lat: '-14.2462',
      trail_long: '-170.6858',
      trail_difficulty: 'moderate',
      park_id: '2',
      trail_image_url:
       'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTYyMzI3MTcvY2ZkMzZhMDQ4Y2QzNmZiMjU4YWQzMzQ4ZmMyZWNkZmQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1735',
      all_trails_url:'https://www.alltrails.com/trail/american-samoa/tutuila/mount-alava-trail?u=i',
      nps_url: 'https://www.nps.gov/places/mount-alava.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7088785/mount-alava-trail'
    },
    {
      id: '6',
      trail_name: 'Tumu Mountain Trail',
      trail_distance: '5.6',
      trail_lat: '-14.28348',
      trail_long: '-170.71318',
      trail_difficulty: 'moderate',
      park_id: '2',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjA2NDA2ODMvZTI3OTk5YWVkMGU4MzAwNWVkY2RiNDgyMTA3ZDUyZTYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1646',
      all_trails_url:'https://www.alltrails.com/trail/american-samoa/ofu-olosega/tumu-mountain-trail?u=i',
      nps_url: null,
      hiking_project_url: null
    },
    {
      id: '7',
      trail_name: 'Park Avenue Trail',
      trail_distance: '2',
      trail_lat: '38.7343',
      trail_long: '-109.5943',
      trail_difficulty: 'short',
      park_id: '3',
      trail_image_url:
        'https://www.encirclephotos.com/wp-content/uploads/Utah-Arches-National-Park-Park-Avenue-Viewpoint-1440x954.jpg',
      trail_elevation: '320',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/park-avenue',
      nps_url: 'https://www.nps.gov/places/park-avenue-viewpoint-and-trailhead.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7002271/park-avenue-trail'
    },
    {
      id: '8',
      trail_name: 'Delicate Arch Trail',
      trail_distance: '3.2',
      trail_lat: '38.7343',
      trail_long: '-109.5943',
      trail_difficulty: 'short',
      park_id: '3',
      trail_image_url:
        'https://www.alltrails.com/api/alltrails/v2/trails/10012464/photos/0?size=larger_wide&key=3p0t5s6b5g4g0e8k3c1j3w7y5c3m4t8i',
      trail_elevation: '629',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/delicate-arch-trail',
      nps_url: 'https://www.nps.gov/places/wolfe-ranch-trailhead.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7002254/delicate-arch-trail'
    },
    {
      id: '9',
      trail_name: 'Devils Garden Trail',
      trail_distance: '7.9',
      trail_lat: '38.802330124',
      trail_long: '-109.608164234',
      trail_difficulty: 'moderate',
      park_id: '3',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTI1MTAwNjgvOTdhMTEzNDQzYjg0ZDYwYjljYTczMTNkMjJkNDFjZDkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '320',
      all_trails_url: 'https://www.alltrails.com/trail/us/utah/devils-garden-loop-trail-with-7-arches',
      nps_url: 'https://www.nps.gov/places/devils-garden-trailhead.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7072499/devils-garden-trail'
    },
    {
      id: '10',
      trail_name: 'Door Trail',
      trail_distance: '0.75',
      trail_lat: '43.7226',
      trail_long: '-102.4842',
      trail_difficulty: 'short',
      park_id: '4',
      trail_image_url:
        'https://www.flashpackingamerica.com/wp-content/uploads/2021/09/best-hikes-in-badlands-door-trail-2-.jpeg',
      trail_elevation: '30',
      all_trails_url:'https://www.alltrails.com/trail/us/maine/the-beehive-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/hike-beehive-loop.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009888/door-trail'
    },
     {
      id: '11',
      trail_name: 'Medicine Root & Castle Trail',
      trail_distance: '4',
      trail_lat: '43.76628',
      trail_long: '-101.94466',
      trail_difficulty: 'short',
      park_id: '4',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/57211763-D664-7276-7B81E3A71215CAF1.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '111',
      all_trails_url:'https://www.alltrails.com/trail/us/south-dakota/medicine-root-and-castle-trail-loop',
      nps_url: 'https://www.nps.gov/places/medicine-root-trailhead.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7004774/medicine-root-loop'
    },
     {
      id: '12',
      trail_name: 'Castle Trail',
      trail_distance: '10.3',
      trail_lat: '43.76199',
      trail_long: '-101.92717',
      trail_difficulty: 'long',
      park_id: '4',
      //badge: longest trail in park
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/111B5B6B-CECC-02B3-237EB5D840F29AAF.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '305',
      all_trails_url:'https://www.alltrails.com/explore/trail/us/south-dakota/castle-trail--4?mobileMap=false&ref=sidebar-static-map',
      nps_url: 'https://www.nps.gov/places/castle-trailhead.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7004804/castle-trail'
    },
    {
      id: '13',
      trail_name: 'Lost Mine Trail',
      trail_distance: '4.8',
      trail_lat: '29.2708',
      trail_long: '-103.3219',
      trail_difficulty: 'short',
      park_id: '5',
      trail_image_url:
        'https://static1.squarespace.com/static/56bfc6c722482edc3dc304c8/5b4001b9562fa7b8dd8b2bf1/5b4108551ae6cf2d20d169b3/1607449693180/?format=1500w',
      trail_elevation: '1100',
      all_trails_url:'https://www.alltrails.com/trail/us/maine/the-beehive-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/hike-beehive-loop.htm',
      hiking_project_url: null
    },
    {
      id: '14',
      trail_name: 'The Window Trail',
      trail_distance: '5.2',
      trail_lat: '29.2708',
      trail_long: '-103.3219',
      trail_difficulty: 'short',
      park_id: '5',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjQ2MzA3NDYvZGQ0Nzk2NjE0YWM1NjFkMDBjYTk2MmExOThhMTc2ZmIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '948',
      all_trails_url:'https://www.alltrails.com/trail/us/texas/the-window-trail',
      nps_url: 'https://www.nps.gov/places/big-bend-window-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7086998/window-trail'
    },
    {
      id: '15',
      trail_name: 'Emory Peak Trail',
      trail_distance: '10.0',
      trail_lat: '29.2708',
      trail_long: '-103.3219',
      trail_difficulty: 'long',
      //badge: Highest point in park
      park_id: '5',
      trail_image_url:
        'https://static1.squarespace.com/static/56bfc6c722482edc3dc304c8/5b4001b9562fa7b8dd8b2bf1/5b4108551ae6cf2d20d169b3/1607449693180/?format=1500w',
      trail_elevation: '1100',
      all_trails_url:'https://www.alltrails.com/trail/us/texas/emory-peak-trail',
      nps_url: 'https://www.nps.gov/common/uploads/cropped_image/primary/F815C7AA-BD81-2854-510560695C2F8BE0.jpg?width=1600&quality=90&mode=crop',
      hiking_project_url: 'https://www.hikingproject.com/trail/7087110/emory-peak-trail'
    },
    {
      id: '16',
      trail_name: 'Jones Lagoon Trail',
      trail_distance: '1.5',
      trail_lat: '25.5015',
      trail_long: '-80.2105',
      trail_difficulty: 'short',
      park_id: '6',
      trail_image_url:
        'https://www.miamiandbeaches.com/getmedia/70a278ec-2691-4425-a5e6-4e2238ea2ae9/gmcvb21_biscayne_map_joneslagoon_1440x900.jpeg',
      trail_elevation: '0',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/jetty-trail',
      nps_url: 'https://www.nps.gov/bisc/planyourvisit/birding-locations.htm',
      hiking_project_url: null
    },
     {
      id: '17',
      trail_name: 'Jetty Trail',
      trail_distance: '0.8',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '6',
      trail_image_url:
        'https://www.miamiandbeaches.com/getmedia/70a278ec-2691-4425-a5e6-4e2238ea2ae9/gmcvb21_biscayne_map_joneslagoon_1440x900.jpeg',
      trail_elevation: '0',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/jetty-trail',
      nps_url: 'https://www.nps.gov/bisc/planyourvisit/convoy-point-jetty-walk-self-guided.htm',
      hiking_project_url: null
    },
     {
      id: '18',
      trail_name: 'Black Creek Canal Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '6',
      trail_image_url:
        'https://www.miamiandbeaches.com/getmedia/70a278ec-2691-4425-a5e6-4e2238ea2ae9/gmcvb21_biscayne_map_joneslagoon_1440x900.jpeg',
      trail_elevation: '3.0',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/black-creek-canal',
      nps_url: 'https://www.nps.gov/bisc/planyourvisit/convoy-point-jetty-walk-self-guided.htm',
      hiking_project_url: null
   },
      {
      id: '19',
      trail_name: 'Warner Point Nature Trail',
      trail_distance: '1.5',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '7',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMTkzMjQ4ODcvNzZkZTJlMWUxOGQ2NTBlOWUyMTBkMDhjOTI4NzU2ZmYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '423',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/warner-point-nature-trail',
      nps_url: null,
      hiking_project_url: 'https://www.hikingproject.com/trail/7014569/warner-point-nature-trail'
    }, {
      id: '20',
      trail_name: 'Green Mountain Summit',
      trail_distance: '6.8',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '7',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA4NjI5MTMvYWIzYTcyOTAwMTRiZjRhMTUzMjg3Y2E4NzRkZmQyZWQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1230',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/green-mountain-summit-via-north-vista-trail',
      nps_url: null,
      hiking_project_url: 'https://www.hikingproject.com/trail/7014552/north-vista-trail'
    }, {
      id: '21',
      trail_name: 'Exclamation Point Trail',
      trail_distance: '2.9',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '7',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk4Nzk5NTIvYTM3MGUzZjNhOWVlYmRkNmMwNGY1N2EzNzk1MDhkMWYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '364',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/exclamation-point',
      nps_url: null,
      hiking_project_url: null
    },{
      id: '22',
      trail_name: 'Navajo / Queens Garden Trail',
      trail_distance: '3.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '8',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk4Nzk5NTIvYTM3MGUzZjNhOWVlYmRkNmMwNGY1N2EzNzk1MDhkMWYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '649',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/navajo-loop-and-queens-garden-trail',
      nps_url: 'https://www.nps.gov/thingstodo/queen-s-navajo-combination-loop.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7015185/queens-garden-navajo-loop-trail'
    },{
      id: '23',
      trail_name: 'Fairyland Loop Trail',
      trail_distance: '7.9',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '8',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk4Nzk5NTIvYTM3MGUzZjNhOWVlYmRkNmMwNGY1N2EzNzk1MDhkMWYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '1558',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/fairyland-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/fairyland-loop.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007939/fairyland-loop-trail'
    },{
      id: '24',
      trail_name: 'Peek-A-Boo Trail',
      trail_distance: '5.2',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '8',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjExMTg3NTUvMTZiMjVlYWUyYjk4MmQ5OWJmODY2OWU4ODNjZTQxMDQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1528',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/peek-a-boo-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/peekaboo-loop.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7015350/peek-a-boo-loop'
    },{
      id: '25',
      trail_name: 'Mesa Arch Trail',
      trail_distance: '0.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '9',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk1NjQ0NDEvNGI5Y2VhZWViOTczZjgxNGRiOWMzNDJkOTNiMmRjMzkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1528',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/mesa-arch',
      nps_url: 'https://www.nps.gov/places/mesa-arch.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7011090/mesa-arch-trail'
    },{
      id: '26',
      trail_name: 'Druid Arch Trail',
      trail_distance: '10.2',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'long',
      park_id: '9',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDc4NzExNTEvNmI0ZmFjMTZlNzUzOWVhYTM0ODllZGU0NGJhY2NkMTcuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1794',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/druid-arch',
      nps_url: 'https://www.nps.gov/places/druid-arch-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7012486/druid-arch'
    },{
      id: '27',
      trail_name: 'Slickrock Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '9',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/37731B6E-DD00-FAAD-CB141E31FB284280.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '1528',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/slickrock-foot-trail',
      nps_url: 'https://www.nps.gov/places/slickrock-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014714/slickrock-trail'
    },{
      id: '28',
      trail_name: 'Hickman Bridge Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.alltrails.com/api/alltrails/v2/trails/10004146/photos/0?size=larger_wide&key=3p0t5s6b5g4g0e8k3c1j3w7y5c3m4t8i',
      trail_elevation: '1.7',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/hickman-bridge-trail',
      nps_url: 'https://www.nps.gov/articles/active-process-monitoring-example-hickman-bridge-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014762/hickman-bridge'
    },{
      id: '29',
      trail_name: 'Grand Wash Trail',
      trail_distance: '5.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '10',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTkzOTU2NTYvMzAyZTFmNTZjMjE5NjE1MmFhMjkzMTM4NTc4NTg5OGMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '341',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/grand-wash-trail-via-northeast-trailhead',
      nps_url: 'https://www.nps.gov/care/learn/photosmultimedia/images/510%20-%20Grand%20Wash-Cassidy%20Arch%20-%20final%20resize.jpg',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014759/grand-wash-trail'
    },{
      id: '30',
      trail_name: 'Chimney Rock Trail',
      trail_distance: '3.3',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/37731B6E-DD00-FAAD-CB141E31FB284280.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '793',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/chimney-rock-loop-trail',
      nps_url: 'https://www.nps.gov/care/planyourvisit/trailguide.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014747/chimney-rock-trail'
   },
      ,{
      id: '28',
      trail_name: 'Hickman Bridge Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.alltrails.com/api/alltrails/v2/trails/10004146/photos/0?size=larger_wide&key=3p0t5s6b5g4g0e8k3c1j3w7y5c3m4t8i',
      trail_elevation: '1.7',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/hickman-bridge-trail',
      nps_url: 'https://www.nps.gov/articles/active-process-monitoring-example-hickman-bridge-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014762/hickman-bridge'
    },{
      id: '29',
      trail_name: 'Grand Wash Trail',
      trail_distance: '5.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '10',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTkzOTU2NTYvMzAyZTFmNTZjMjE5NjE1MmFhMjkzMTM4NTc4NTg5OGMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '341',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/grand-wash-trail-via-northeast-trailhead',
      nps_url: 'https://www.nps.gov/care/learn/photosmultimedia/images/510%20-%20Grand%20Wash-Cassidy%20Arch%20-%20final%20resize.jpg',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014759/grand-wash-trail'
    },{
      id: '30',
      trail_name: 'Chimney Rock Trail',
      trail_distance: '3.3',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/37731B6E-DD00-FAAD-CB141E31FB284280.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '793',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/chimney-rock-loop-trail',
      nps_url: 'https://www.nps.gov/care/planyourvisit/trailguide.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014747/chimney-rock-trail'
    },,{
      id: '28',
      trail_name: 'Hickman Bridge Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.alltrails.com/api/alltrails/v2/trails/10004146/photos/0?size=larger_wide&key=3p0t5s6b5g4g0e8k3c1j3w7y5c3m4t8i',
      trail_elevation: '1.7',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/hickman-bridge-trail',
      nps_url: 'https://www.nps.gov/articles/active-process-monitoring-example-hickman-bridge-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014762/hickman-bridge'
    },{
      id: '29',
      trail_name: 'Grand Wash Trail',
      trail_distance: '5.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '10',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTkzOTU2NTYvMzAyZTFmNTZjMjE5NjE1MmFhMjkzMTM4NTc4NTg5OGMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '341',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/grand-wash-trail-via-northeast-trailhead',
      nps_url: 'https://www.nps.gov/care/learn/photosmultimedia/images/510%20-%20Grand%20Wash-Cassidy%20Arch%20-%20final%20resize.jpg',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014759/grand-wash-trail'
    },{
      id: '30',
      trail_name: 'Chimney Rock Trail',
      trail_distance: '3.3',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '10',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/37731B6E-DD00-FAAD-CB141E31FB284280.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '793',
      all_trails_url:'https://www.alltrails.com/trail/us/utah/chimney-rock-loop-trail',
      nps_url: 'https://www.nps.gov/care/planyourvisit/trailguide.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014747/chimney-rock-trail'
    },,{
      id: '31',
      trail_name: 'Old Guano Trail',
      trail_distance: '7.5',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '11',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTMwNDU4NDQvOTY1NGE3ZjZkOTUyN2RkOTZhYTMzOTFmYWVmOTdkZDAuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '780',
      all_trails_url:'https://www.alltrails.com/trail/us/new-mexico/old-guano-trail-to-white-s-city',
      nps_url: 'https://www.nps.gov/cave/old-guano-road.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016827/old-guano-road-trail'
    },{
      id: '32',
      trail_name: 'Rattlesnake Canyon Loop',
      trail_distance: '5.4',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '11',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDM4OTUyMzMvNzZkMTQ1MTNhNWMxYTkzMjQwYzAyNmZlNTU5MmE0NDguanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '659',
      all_trails_url:'https://www.alltrails.com/trail/us/new-mexico/rattlesnake-canyon--3',
      nps_url: 'https://www.nps.gov/cave/lower-rattlesnake-canyon.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7048519/rattlesnake-canyon-loop'
    },{
      id: '33',
      trail_name: 'Chihuahuan Nature Trail',
      trail_distance: '0.8',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '11',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/37731B6E-DD00-FAAD-CB141E31FB284280.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '75',
      all_trails_url:'https://www.alltrails.com/trail/us/new-mexico/carlsbad-caverns-national-park-trail',
      nps_url: 'https://www.nps.gov/cave/chihuahuan-desert-nature-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016839/chihuahuan-desert-nature-trail'
    },{
      id: '34',
      trail_name: 'Potato Harbor Trail',
      trail_distance: '5.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '12',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjIyOTcwMTYvZjk3Mzk5Nzk5MWU5ODk1MDY5MjZmZGQyNGNhNTU5NmMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '620',
      all_trails_url:'https://www.alltrails.com/trail/us/california/potato-harbor',
      nps_url: 'https://www.nps.gov/cave/chihuahuan-desert-nature-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016839/chihuahuan-desert-nature-trail'
    },{
      id: '35',
      trail_name: 'Cavern Point Loop',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '12',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/071A2B7A-F149-4293-0097B2262EF4CAE3.jpg?width=1600&quality=90&mode=crop',
      trail_elevation: '288',
      all_trails_url:'https://www.alltrails.com/trail/us/california/cavern-point-loop--2',
      nps_url: 'https://www.nps.gov/places/cavern-point-loop-hike.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010053/cavern-point-loop-trail'
    },{
      id: '36',
      trail_name: 'Smugglers Cove',
      trail_distance: '7.7',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '12',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA3OTMwNDUvYWIzMjM1ZGI4NzJkOGM2MTUxYTRmNTIwOWI0MzBkOTkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1414',
      all_trails_url:'https://www.alltrails.com/trail/us/california/smugglers-cove--2',
      nps_url: 'https://www.nps.gov/places/000/sign-smugglers-cove-welcome.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010045/smugglers-road'
    },{
      id: '37',
      trail_name: 'Boardwalk Loop Trail',
      trail_distance: '2.3',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '13',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzYxMTMwMDYvNmRmNjQ5NWMyNjFiMTEzOWYyMDcyZjcwM2Y2OGMyNzMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '13',
      all_trails_url:'https://www.alltrails.com/trail/us/south-carolina/boardwalk-loop-trail--2',
      nps_url: 'https://www.nps.gov/cong/planyourvisit/boardwalk.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7012998/boardwalk-loop-trail'
    },{
      id: '38',
      trail_name: 'Oakridge Trail',
      trail_distance: '6.8',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '13',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjAxNjU0MTUvMGI2YTg4MGJmY2YwNTBlNGZiODgzYjE1MTFkMzhiNzkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '16',
      all_trails_url:'https://www.alltrails.com/trail/us/south-carolina/oakridge-trail',
      nps_url: 'https://www.nps.gov/cong/planyourvisit/trail-information.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016829/oakridge-trail'
    },{
      id: '39',
      trail_name: 'Conagree River Trail',
      trail_distance: '10.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'long',
      park_id: '13',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA3OTMwNDUvYWIzMjM1ZGI4NzJkOGM2MTUxYTRmNTIwOWI0MzBkOTkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '45',
      all_trails_url:'https://www.nps.gov/cong/planyourvisit/trail-information.htm',
      nps_url: 'https://www.nps.gov/places/000/sign-smugglers-cove-welcome.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7089510/congaree-long-loop'
    },{
      id: '40',
      trail_name: 'Cleetwood Cove Trail',
      trail_distance: '2.1',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
      park_id: '14',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTUyMTE5MTMvYTVmMWRiYjNkNWUxNGY1NDhkYzhiNWQ0ZWM4NDJmZmIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '610',
      all_trails_url:'https://www.alltrails.com/trail/us/oregon/cleetwood-cove-trail',
      nps_url: 'https://www.nps.gov/crla/planyourvisit/cleetwood-cove.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009097/cleetwood-cove-trail'
    },{
      id: '40',
      trail_name: 'Crater Peak Trail',
      trail_distance: '6.4',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'moderate',
      park_id: '14',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTI2NTEwODAvODcwOGQ0NjQ4YjA2Yzk4ZTMyYTMyY2QxZmQxMmUxNWUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '1174',
      all_trails_url:'https://www.alltrails.com/trail/us/oregon/crater-peak-trail',
      nps_url: 'https://www.nps.gov/crla/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009099/crater-peak-trail'
    },{
      id: '42',
      trail_name: 'Plaikni Falls Trail',
      trail_distance: '2.0',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '14',
      //?badge: hike to a water fall
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzg3ODA4NjQvZGM4M2E4ZDlkZGQwMzBhYTkxZDE0NmY1ZWNiODIzZjEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '147',
      all_trails_url:'https://www.alltrails.com/trail/us/oregon/plaikni-falls-trail',
      nps_url: 'https://www.nps.gov/crla/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7013763/plaikni-falls'
    },{
      id: '43',
      trail_name: 'Cuyahoga Valley Ledges Trail',
      trail_distance: '2.3',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '15',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjM3OTk0MTAvMmYwMjI0NmM3NGUyYTMyNzE5OWUyOTkyNDVjMjg5YTYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '203',
      all_trails_url:'https://www.alltrails.com/trail/us/ohio/cuyahoga-valley-ledges-trail',
      nps_url: 'https://www.nps.gov/cuva/the-ledges.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7015789/ledges-trail'
    },{
      id: '44',
      trail_name: 'Blue Hen Falls Trail',
      trail_distance: '2.5',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '15',
      //?badge: hike to a water fall
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzg3ODA4NjQvZGM4M2E4ZDlkZGQwMzBhYTkxZDE0NmY1ZWNiODIzZjEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '498',
      all_trails_url:'https://www.alltrails.com/trail/us/ohio/blue-hen-falls-trail--2',
      nps_url: 'https://www.nps.gov/thingstodo/hike-to-blue-hen-falls.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7013161/blue-hen-falls-trail'
    },{
      id: '45',
      trail_name: 'Plateau Trail',
      trail_distance: '4.6',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '15',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjExOTM2NzcvNDQxYTkxYTRhY2IyMGI5MjUxNGIxM2E3YmRmOGU4N2IuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '341',
      all_trails_url:'https://www.alltrails.com/trail/us/ohio/plateau-trail',
      nps_url: 'https://www.nps.gov/cuva/index.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016533/plateau-trail'
    },{
      id: '46',
      trail_name: 'Badwater Basin Salt Flats Trail',
      trail_distance: '1.9',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '16',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA1MDg5NDkvM2I4OTNmNTZmYTU5NTI5ZmU4YjJmZTkyOGEwOGYwMzkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '0',
        all_trails_url: 'https://www.alltrails.com/trail/us/california/badwater-basin-salt-flats-trail',
      //? lowest point in north america  282 ft (86 m) below sea level
      nps_url: 'https://www.nps.gov/places/badwater-basin.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7006520/badwater-basin-crossing'
    },{
      id: '47',
      trail_name: 'Gower Gulch Loop Trail',
      trail_distance: '4.6',
      trail_lat: null,
      trail_long: null,
      trail_difficulty: 'short',
        park_id: '16',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDM5NzAyNTgvY2MzMjUwZDFhMmMwYmJmOGFmOWI5YTQyZGMwZDM4ZmQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '715',
      all_trails_url:'https://www.alltrails.com/trail/us/california/gower-gulch-loop-trail',
      nps_url: 'https://www.nps.gov/deva/planyourvisit/golden-canyon.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7013364/gower-gulch-trail'
    },{
      id: '48',
      trail_name: 'Telescope Peak Trail',
      trail_distance: '12.2',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
      //badge highest point in death valley
        park_id: '16',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDE5MjMxMTAvNzkzZThkZGE0MzI1YTA4ZjE1OTIxMDBhMDI4NWZmZjEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '3244',
      all_trails_url:'https://www.alltrails.com/trail/us/california/telescope-peak-trail',
      nps_url: 'https://www.nps.gov/deva/learn/news/telescope-peak-sar-2023-02-01.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7011087/telescope-peak-trail'
    },{
      id: '49',
      trail_name: 'Horseshoe Lake Trail',
      trail_distance: '2.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '17',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDkzOTc2NDYvZTFhYjZkMjU1YTgzYjJhMTY2ZjA2NjBjMDkzNzNlZTkuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '380',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/horseshoe-lake-trail',
      nps_url: 'https://www.nps.gov/dena/planyourvisit/horseshoe-lake-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010586/horseshoe-lake'
    },{
      id: '50',
      trail_name: 'Mount Healy Overlook Trail',
      trail_distance: '6.9',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '17',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDE5MjMxMTAvNzkzZThkZGE0MzI1YTA4ZjE1OTIxMDBhMDI4NWZmZjEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2483',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/mount-healy-overlook-trail',
      nps_url: 'https://www.nps.gov/dena/planyourvisit/overlook.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7021165/mt-healy-out-and-back'
    },{
      id: '51',
      trail_name: 'Savage River Loop',
      trail_distance: '2.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '17',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA5MzUxNDIvOTk4MTJlYjJiOGJkODkwYjY5N2ZlZWU5NDRmNDIzMzEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '459',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/savage-river-loop-trail',
      nps_url: 'https://www.nps.gov/dena/planyourvisit/savage-river-area.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010605/savage-river-loop-trail'
    },{
      id: '52',
      trail_name: 'Fort Jefferson Loop',
      trail_distance: '0.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '18',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjkzOTcxMjYvMzBmZmE5ZWQxMGU5OTJjNjNhMmJkZGUzN2YyNzUwN2QuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '3',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/fort-jefferson-loop',
      nps_url: 'https://www.nps.gov/drto/learn/historyculture/fort-jefferson.htm',
      hiking_project_url: null
    },{
      id: '53',
      trail_name: 'Bush Key Trail',
      trail_distance: '0.9',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '18',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDM1NDM4OTkvNDY3ZmZhMWEzMDRlYmFlYjhlMTU5NmZkNmEyMjA3NmIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '0',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/bush-key-trail',
      nps_url: 'https://www.nps.gov/drto/planyourvisit/bush-key.htm',
      hiking_project_url: null
    },{
      id: '54',
      trail_name: 'Shark Valley Trail',
      trail_distance: '14.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '19',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjExMDUwMDUvOGVjYTg3ODQyNjM3MTNkNDRkMjMxNjIxY2JmZjgxNTQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '26',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/shark-valley-tram-trail',
      nps_url: 'https://www.nps.gov/ever/planyourvisit/shark-valley-trails.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7016797/tram-trail'
    },{
      id: '55',
      trail_name: 'Long Pine Key Trail',
      trail_distance: '11.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '19',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTQ4NzQ1OTIvZWM0MjFjNWRjMWNjNzIyM2I5YmExY2RmOTM4YWRjOTIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '0',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/long-pine-key-trail',
      nps_url: 'https://www.nps.gov/ever/planyourvisit/long-pine-key-trails.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7069772/long-pine-key-loop'
   },{
      id: '56',
      trail_name: 'Snake Bight Trail',
      trail_distance: '3.6',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '19',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTc2MTk0NzIvNzI0Mzk0NGVlODRhMGUwMjFmMTAzYjg0MWU3ZjllY2IuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '26',
      all_trails_url:'https://www.alltrails.com/trail/us/florida/snake-bight-trail',
      nps_url: 'https://www.nps.gov/ever/planyourvisit/snake-bight-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7019127/snake-bight-rowdy-bend-loop'
    },{
      id: '57',
      trail_name: 'Arrigetch Peak',
      trail_distance: '27.7',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '20',
        //?badge: Brooks Range, the most northerly mountain range in North America or  landmark to the inland Eskimo of northwestern Alaska and the word ‘Arrigetch’ means “fingers of the hand extended”
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTc2MTk0NzIvNzI0Mzk0NGVlODRhMGUwMjFmMTAzYjg0MWU3ZjllY2IuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '7801',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/arrigetch-peaks',
      nps_url: 'https://www.nps.gov/gaar/planyourvisit/arrigetch-peaks.htm',
      hiking_project_url: null
    },{
      id: '58',
      trail_name: 'Jefferson Memorial',
      trail_distance: '1.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '21',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDg4MTg1MTgvZGU3YTYxZDI4ZmY2Yjg2OWY3ODBlYTY0ZTc1OTg4NTUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '75',
      all_trails_url:'https://www.alltrails.com/trail/us/missouri/jefferson-national-expansion-memorial',
      nps_url: 'https://www.nps.gov/articles/jefferson-national-expansion-memorial.htm',
      hiking_project_url: null
    },{
      id: '59',
      trail_name: 'Forest Trail',
      trail_distance: '1.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '22',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA0ODcxNDMvYmYwNjEwNzU1MTdhNzNjNmRkOGY3YjM3NWI3ZTdjZmUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '118',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/forest-trail',
      nps_url: 'https://www.nps.gov/glba/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7018852/forest-trail'
    },{
      id: '60',
      trail_name: 'Bartlett River Trail',
      trail_distance: '4.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '22',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjEwMDg4NjcvNDczN2U3YzU0ZmY4NTg2YzA1OTAwNDA5ZDZkNzk2YTIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '495',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/bartlett-river-trail',
      nps_url: 'https://www.nps.gov/glba/planyourvisit/bartlett-cove-trails.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7018847/bartlett-river-trail'
    },{
      id: '61',
      trail_name: 'Point Gustavus Trail',
      trail_distance: '12.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '22',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzc5MjM0OTgvZGJjNmI4YWRjOTk3MDU5ZmQxYzY2YmNiN2E4OWI4NDUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '534',
      all_trails_url:'https://www.alltrails.com/trail/us/alaska/point-gustavus-via-beach-trail',
      nps_url: 'https://www.nps.gov/glba/planyourvisit/gustavus.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7030570/point-gustavus-route'
    },{
      id: '62',
      trail_name: 'Avalanche Lake',
      trail_distance: '5.9',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '23',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjMxNTU3MDUvYTc3MzY5ZDFhMDI2NDJiOTA0Yjg4NGIyMmY5NzdmYjguanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '757',
      all_trails_url:'https://www.alltrails.com/trail/us/montana/avalanche-lake--6',
      nps_url: 'https://www.nps.gov/thingstodo/hike-to-avalanche-lake.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7078877/avalanche-lake-trail-152'
    },{
      id: '63',
      trail_name: 'Redrock Falls',
      trail_distance: '3.7',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '23',
        //badge: waterfall
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzc5NjkxNzAvYTE0ZDkzZDRhNzVhNWUyNWRlNmNhZmZlMjRjMGNlMDQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '242',
      all_trails_url:'https://www.alltrails.com/trail/us/montana/redrock-falls-via-swiftcurrent-pass/photos',
      nps_url: null,
      hiking_project_url: 'hhttps://www.hikingproject.com/gem/355/redrock-falls'
    },{
      id: '64',
      trail_name: 'Highline Trail',
      trail_distance: '14.9',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '23',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTAwMjM1NTQvZGNmMDZhMWZiMjM2MWQ4MGQwMzEwNzIxNzcyOGRmYWUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2621',
      all_trails_url:'https://www.alltrails.com/trail/us/montana/highline-trail',
      nps_url: 'https://www.nps.gov/glac/planyourvisit/hikingthetrails.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007867/highline-trail'
    },{
      id: '65',
      trail_name: 'Bright Angel Trail',
      trail_distance: '15.3',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '24',
        //badge most popular trail in grand canyon
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzAzMzQ5MjUvY2RiMzdhNDgwMGMyMTVhMzUxYTY1YzRjNDNiYmYxMWQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '4478',
      all_trails_url:'https://www.alltrails.com/trail/us/arizona/bright-angel-trail--11',
      nps_url: 'https://www.nps.gov/places/000/bright-angel-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7004880/bright-angel-trail'
    },{
      id: '66',
      trail_name: 'Skeleton Point Trail',
      trail_distance: '5.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '24',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk4MzA0OTEvZjc1ZTMzNjVjZjY5MWQwZmY3ZWY5MWJiNTAxMDQyYWMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2027',
      all_trails_url:'https://www.alltrails.com/trail/us/arizona/south-kaibab-trail-to-skeleton-point',
      nps_url: 'https://www.nps.gov/places/000/south-kaibab-trail.htm',
      hiking_project_url: null
   },
      {
      id: '67',
      trail_name: 'Rim Trail',
      trail_distance: '13',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '24',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNTk4MzA0OTEvZjc1ZTMzNjVjZjY5MWQwZmY3ZWY5MWJiNTAxMDQyYWMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '583',
      all_trails_url:'https://www.alltrails.com/trail/us/arizona/grand-canyon-rim-trail--3',
      nps_url: 'https://www.nps.gov/grca/planyourvisit/upload/rimtrail.pdf',
      hiking_project_url: 'https://www.hikingproject.com/trail/7003271/rim-trail'
    },{
      id: '68',
      trail_name: 'Cascade Canyon Trail',
      trail_distance: '9.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '25',
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/683BE1FD-92ED-2145-FDB12957E4F7A549.jpg?width=1300&quality=90&mode=crop',
      trail_elevation: '1102',
      all_trails_url:'https://www.alltrails.com/trail/us/wyoming/cascade-canyon-trail',
      nps_url: 'https://www.nps.gov/thingstodo/cascadecanyon.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7000089/cascade-canyon-trail'
   },
      {
      id: '69',
      trail_name: 'Hidden Falls Trail',
      trail_distance: '1.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '25',
        //badge waterfall wyoming
      trail_image_url:
        'https://www.nps.gov/common/uploads/cropped_image/primary/67BFBB22-9A01-3B91-D6C8C4A6107CB471.jpg?width=1300&quality=90&mode=crop',
      trail_elevation: '1102',
      all_trails_url:'https://www.alltrails.com/trail/us/wyoming/hidden-falls-trail--2',
      nps_url: 'https://www.nps.gov/thingstodo/hiddenfalls.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7006983/hidden-falls'
   },
      {
      id: '70',
      trail_name: 'Lake Solitude Trail',
      trail_distance: '16.6',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '25',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjA4MDIzMTIvNTQ5OTYwNDUwMTZiZjIzYmNiMjQ1MzYyMjg1N2FiYTEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2670',
      all_trails_url:'https://www.alltrails.com/trail/us/wyoming/lake-solitude-trail',
      nps_url: 'https://www.nps.gov/thingstodo/lakesolitude.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7000087/lake-solitude'
    },{
      id: '71',
      trail_name: 'Bristlecone Pine Glacier Trail',
      trail_distance: '4.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '26',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjEyMDM0NzkvMTI2Y2E2NGRjNThjNjE0ZThiN2U4NTVkZWMxNWUxZjUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1059',
      all_trails_url:'https://www.alltrails.com/trail/us/nevada/bristlecone-pine-glacier-trail--2',
      nps_url: 'https://www.nps.gov/grba/planyourvisit/hiking-information.htm',
      hiking_project_url: 'https://www.hikingproject.com/gem/166/bristlecone-pine-grove'
   },
      {
      id: '73',
      trail_name: 'Teresa Lake Trail',
      trail_distance: '1.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '26',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDc2Mjg2MDEvM2ZiNjRhNDUwNDczOTdiZmIzZmU1YTMxYTQ0ODU5MzAuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '305',
      all_trails_url:'https://www.alltrails.com/trail/us/nevada/teresa-lake',
      nps_url: 'https://www.nps.gov/places/teresa-lake.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009212/alpine-lakes-loop-trail'
    },{
      id: '74',
      trail_name: 'Wheeler Peak Summit',
      trail_distance: '8.0',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '26',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDc2Mjg2MDEvM2ZiNjRhNDUwNDczOTdiZmIzZmU1YTMxYTQ0ODU5MzAuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '2906',
      all_trails_url:'https://www.alltrails.com/trail/us/nevada/wheeler-peak-trail-via-stella-lake-trail',
      nps_url: 'https://www.nps.gov/places/wheeler-peak.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009201/wheeler-peak-summit-hike'
   },
      {
      id: '75',
      trail_name: 'High Dune Trail',
      trail_distance: '3.0',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '27',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjg1MDYyNTcvNzkxZjY5YTI3ZDhjYjk4MTg1OTA2Yzc1NmRkYThmODYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '629',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/high-dune-trail',
      nps_url: 'https://www.nps.gov/indu/learn/news/singing-sands-winter-spring-2020.htm',
      hiking_project_url: 'https://www.hikingproject.com/photo/7050340/high-dune-trail-great-sand-dunes-national-park'
   },
      {
      id: '76',
      trail_name: 'Mosca Pass Trail',
      trail_distance: '6.2',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '27',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA4MDQyMjIvMTlhN2IxYzkwYTkxMDlkZjNkMjk0MjE0MDAwNDFkNjMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '1407',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/mosca-pass-trail--3',
      nps_url: 'https://www.nps.gov/places/mosca-pass.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009882/mosca-pass-trail'
   },
      {
      id: '77',
      trail_name: 'Sand Dunes Loop',
      trail_distance: '5.2',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '27',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjMxMDgxMDYvOTBmMWU2N2U0YWM2NTE1ZDFhYTkwMTVlNDdhMjkxYmYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '698',
      all_trails_url:'https://www.alltrails.com/trail/us/colorado/sand-dunes-loop-trail',
      nps_url: 'https://www.nps.gov/indu/learn/news/singing-sands-winter-spring-2020.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7014510/sand-dunes-loop'
   },
      {
      id: '78',
      trail_name: 'Laurel Falls Trail',
      trail_distance: '2.4',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '28',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjEyOTA1NjQvZmU3NzhiMDc2ODQyOWQ2NmUwZGIxMmVkMTg4NWU2NTQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '403',
      all_trails_url:'https://www.alltrails.com/trail/us/tennessee/laurel-falls--2',
      nps_url: 'https://www.nps.gov/grsm/planyourvisit/laurel-falls.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7098921/laurel-falls-trail'
   },
      {
      id: '79',
      trail_name: 'Rainbow Falls Trail',
      trail_distance: '5.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '28',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjI2NTE2NzgvNzFjMTk4ZWEwNTc2NzJmZWQzMTgyNjhhMDQ5Y2Y3YWMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '1617',
      all_trails_url:'https://www.alltrails.com/trail/us/tennessee/rainbow-falls-trail',
      nps_url: 'https://www.nps.gov/grsm/planyourvisit/chimneys-alternative-rainbow-falls.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7093318/rainbow-falls-trail'
   },
      {
      id: '80',
      trail_name: 'Guadalupe Peak Trail',
      trail_distance: '8.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '29',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA2MDk4ODMvNjliNmMxOWQwNGE5ZTYwMTZjYTA5ZDJhMmNmMTQ2MGIuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2949',
      all_trails_url:'https://www.alltrails.com/trail/us/texas/guadalupe-peak-texas-highpoint-trail',
      nps_url: 'https://www.nps.gov/thingstodo/gumo_hike_guadalupe_peak.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010158/guadalupe-peak-trail'
    },{
      id: '81',
      trail_name: 'Devils Hall Trail',
      trail_distance: '3.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '29',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDU2NjA2OTEvNTNjYzA3YTY2ZmQ1MjA3NWJiZGVjZmJjYTQxODk0NzguanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '600',
      all_trails_url:'https://www.alltrails.com/trail/us/texas/devils-hall',
      nps_url: 'https://www.nps.gov/thingstodo/gumo_hike_devils_hall_trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010153/devils-hall-traill'
   },
      {
      id: '82',
      trail_name: 'Bush Mountain Trail',
      trail_distance: '13.2',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '29',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMTE0NjYwMjkvZGZiMTliNzBmMzRiY2E0YmYxMDBkMGM1M2ZjMWU5YjYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '3599',
      all_trails_url:'https://www.alltrails.com/trail/us/texas/bush-mountain-trail',
      nps_url: 'https://www.nps.gov/places/gumo_bush_mountain.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7010152/bush-mountain-trail'
   },
      {
      id: '83',
      trail_name: 'Pipiwai Trail',
      trail_distance: '3.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'short',
        park_id: '30',
        //badge: waterfall
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDUzODQzMjUvMzBhMDA2MTkzMmE0Y2RkNzljZGMwYmEyOTMxMTEyNDAuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '908',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/maui/waimoku-falls-via-pipiwai-trail?u=i',
      nps_url: 'https://www.nps.gov/hale/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009556/pipiwai-trail'
   },
      {
      id: '84',
      trail_name: 'Halemauu Overlook Trail',
      trail_distance: '7.6',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '30',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzk5NzA3MDkvZjE1YTRkOTM0YmJjYjM5ZmQ4NWVmNGE5ZjlhMjcxMTQuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '2375',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/maui/halemauu-haleakala-overlook-trail?u=i',
      nps_url: 'https://www.nps.gov/hale/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009540/halemauu-trail'
   },
      {
      id: '85',
      trail_name: 'Sliding Sands Trail',
      trail_distance: '11.1',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'Hard',
        park_id: '30',

      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA5Nzg2NjYvZmYwY2JiMjAyN2NkNzY2MTMyNzcwMDhmZGVlZjdhZWUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2467',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/maui/sliding-sands-keonehe-ehe-e?u=i',
      nps_url: 'https://www.nps.gov/hale/planyourvisit/hiking.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7017615/sliding-sands-out-and-back'
   },
       {
      id: '86',
      trail_name: 'Kilauea Iki Crater Loop',
      trail_distance: '3.3',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'easy',
        park_id: '31',

      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjUyMjA1MTIvMjA4N2ViZmMwM2M4MDk4MDczZGQ2NmIzM2NlMGQwNTMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjoyMDQ4LCJoZWlnaHQiOjIwNDgsImZpdCI6Imluc2lkZSJ9LCJyb3RhdGUiOm51bGwsImpwZWciOnsidHJlbGxpc1F1YW50aXNhdGlvbiI6dHJ1ZSwib3ZlcnNob290RGVyaW5naW5nIjp0cnVlLCJvcHRpbWlzZVNjYW5zIjp0cnVlLCJxdWFudGlzYXRpb25UYWJsZSI6M319fQ==',
      trail_elevation: '741',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/hawaii/kilauea-iki-trail-and-crater-rim-trail?u=i',
      nps_url: 'https://www.nps.gov/havo/planyourvisit/kilauea-iki-trail-from-kilauea-visitor-center.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7015672/kilauea-iki-crater-loop'
   },
        {
      id: '87',
      trail_name: 'Halemaumau Trail',
      trail_distance: '1.7',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'easy',
        park_id: '31',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDg0Mjg1ODAvN2ZmMThlNmUwOWEyZWJjYjg2M2QxOTBmMmQyZmNhNTAuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '459',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/hawaii/halemaumau-trail?u=i',
      nps_url: 'https://www.nps.gov/havo/planyourvisit/kilauea-iki-trail-from-kilauea-visitor-center.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009330/halemaumau-trail'
   },
        {
      id: '88',
      trail_name: 'Napau Trail',
      trail_distance: '11.8',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'moderate',
        park_id: '31',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMjA0MjAyMzMvYjllMWVjY2MxZTI3MmNiM2MwMjNkNTJlMGNkZGY2MmYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2040',
      all_trails_url:'https://www.alltrails.com/trail/hawaii/hawaii/napau-crater-via-napau-trail?u=i',
      nps_url: 'https://www.nps.gov/havo/planyourvisit/hike_napau.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7009342/napau-trail'
   },
           {
      id: '89',
      trail_name: 'Goat Rock Trail',
      trail_distance: '2.5',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'easy',
        park_id: '32',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvMzY2OTMxMjYvNGJhNzk2ZGIyNDI4ZWQ2OWZiN2Y4OTVmY2M1OTAxMmMuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '406',
      all_trails_url:'https://www.alltrails.com/trail/us/arkansas/goat-rock-trail--3',
      nps_url: 'https://www.nps.gov/thingstodo/goat-rock-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007972/goat-rock-trail'
   },
            {
      id: '90',
      trail_name: 'Gulpha Gorge Trail',
      trail_distance: '1.4',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'easy',
        park_id: '32',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNjA5NDg0MjcvYmJiNjgwMTIzYjZhMjJjYjk0NjBkMmNkODI0YjNjYzYuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '383',
      all_trails_url:'https://www.alltrails.com/trail/us/arkansas/gulpha-gorge-trail',
      nps_url: 'https://www.alltrails.com/trail/us/arkansas/gulpha-gorge-trail',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007973/gulpha-gorge-trail'
   },
            {
      id: '91',
      trail_name: 'Sunset Trail',
      trail_distance: '12.9',
      trail_lat: null,
      trail_long: null,
        trail_difficulty: 'long',
        park_id: '32',
      trail_image_url:
        'https://images.alltrails.com/eyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvNDc2NzI2NjYvOTBkYWNhOWFiYTk3OWY0YzA2NjM4ZWI2NTE5NGIzNjEuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJqcGVnIiwicmVzaXplIjp7IndpZHRoIjo1MDAsImhlaWdodCI6NTAwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJqcGVnIjp7InRyZWxsaXNRdWFudGlzYXRpb24iOnRydWUsIm92ZXJzaG9vdERlcmluZ2luZyI6dHJ1ZSwib3B0aW1pc2VTY2FucyI6dHJ1ZSwicXVhbnRpc2F0aW9uVGFibGUiOjN9fX0=',
      trail_elevation: '2365',
      all_trails_url:'https://www.alltrails.com/trail/us/arkansas/sunset-loop-trail',
      nps_url: 'https://www.nps.gov/thingstodo/hikethe-sunset-trail.htm',
      hiking_project_url: 'https://www.hikingproject.com/trail/7007987/sunset-trail'
    },
  ]);
