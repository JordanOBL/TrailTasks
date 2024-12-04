const masterAchievementList = [
  {
    achievement_name: 'Acadia Park Conqueror',
    achievement_description: 'Hike all trails in Acadia National Park.',
    achievement_image_url: 'https://example.com/acadia_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1,2,3',
  },
  {
    achievement_name: 'American Samoa Park Conqueror',
    achievement_description: 'Hike all trails in American Samoa National Park.',
    achievement_image_url: 'https://example.com/american_samoa_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '4,5,6',
  },
  {
    achievement_name: 'Arches Park Conqueror',
    achievement_description: 'Hike all trails in Arches National Park.',
    achievement_image_url: 'https://example.com/arches_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '7,8,9',
  },
  {
    achievement_name: 'Badlands Park Conqueror',
    achievement_description: 'Hike all trails in Badlands National Park.',
    achievement_image_url: 'https://example.com/badlands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '10,11,12',
  },
  {
    achievement_name: 'Big Bend Park Conqueror',
    achievement_description: 'Hike all trails in Big Bend National Park.',
    achievement_image_url: 'https://example.com/big_bend_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '13,14,15',
  },
  {
    achievement_name: 'Biscayne Park Conqueror',
    achievement_description: 'Hike all trails in Biscayne National Park.',
    achievement_image_url: 'https://example.com/biscayne_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '16,17,18',
  },
  {
    achievement_name: 'Black Canyon of the Gunnison Park Conqueror',
    achievement_description:
      'Hike all trails in Black Canyon of the Gunnison National Park.',
    achievement_image_url: 'https://example.com/black_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '19,20,21',
  },
  {
    achievement_name: 'Bryce Canyon Park Conqueror',
    achievement_description: 'Hike all trails in Bryce Canyon National Park.',
    achievement_image_url: 'https://example.com/bryce_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '22,23,24',
  },
  {
    achievement_name: 'Canyonlands Park Conqueror',
    achievement_description: 'Hike all trails in Canyonlands National Park.',
    achievement_image_url: 'https://example.com/canyonlands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '25,26,27',
  },
  {
    achievement_name: 'Capitol Reef Park Conqueror',
    achievement_description: 'Hike all trails in Capitol Reef National Park.',
    achievement_image_url: 'https://example.com/capitol_reef_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '28,29,30',
  },
  {
    achievement_name: 'Carlsbad Caverns Park Conqueror',
    achievement_description:
      'Hike all trails in Carlsbad Caverns National Park.',
    achievement_image_url:
      'https://example.com/carlsbad_caverns_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '31,32,33',
  },
  {
    achievement_name: 'Channel Islands Park Conqueror',
    achievement_description:
      'Hike all trails in Channel Islands National Park.',
    achievement_image_url: 'https://example.com/channel_islands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '34,35,36',
  },
  {
    achievement_name: 'Congaree Park Conqueror',
    achievement_description: 'Hike all trails in Congaree National Park.',
    achievement_image_url: 'https://example.com/congaree_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '37,38,39',
  },
  {
    achievement_name: 'Crater Lake Park Conqueror',
    achievement_description: 'Hike all trails in Crater Lake National Park.',
    achievement_image_url: 'https://example.com/crater_lake_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '40,41,42',
  },
  {
    achievement_name: 'Cuyahoga Valley Park Conqueror',
    achievement_description:
      'Hike all trails in Cuyahoga Valley National Park.',
    achievement_image_url: 'https://example.com/cuyahoga_valley_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '43,44,45',
  },
  {
    achievement_name: 'Death Valley Park Conqueror',
    achievement_description: 'Hike all trails in Death Valley National Park.',
    achievement_image_url: 'https://example.com/death_valley_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '46,47,48',
  },
  {
    achievement_name: 'Denali Park Conqueror',
    achievement_description: 'Hike all trails in Denali National Park.',
    achievement_image_url: 'https://example.com/denali_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '49,50,51',
  },
  {
    achievement_name: 'Dry Tortugas Park Conqueror',
    achievement_description: 'Hike all trails in Dry Tortugas National Park.',
    achievement_image_url: 'https://example.com/dry_tortugas_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '52,53',
  },
  {
    achievement_name: 'Everglades Park Conqueror',
    achievement_description: 'Hike all trails in Everglades National Park.',
    achievement_image_url: 'https://example.com/everglades_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '54,55,56',
  },
  {
    achievement_name: 'Gates of the Arctic Park Conqueror',
    achievement_description:
      'Hike all trails in Gates of the Arctic National Park.',
    achievement_image_url:
      'https://example.com/gates_of_the_arctic_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '57',
  },
  {
    achievement_name: 'Gateway Arch Park Conqueror',
    achievement_description: 'Hike all trails in Gateway Arch National Park.',
    achievement_image_url: 'https://example.com/gateway_arch_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '58',
  },
  {
    achievement_name: 'Glacier Bay Park Conqueror',
    achievement_description: 'Hike all trails in Glacier Bay National Park.',
    achievement_image_url: 'https://example.com/glacier_bay_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '59,60,61',
  },
  {
    achievement_name: 'Glacier Park Conqueror',
    achievement_description: 'Hike all trails in Glacier National Park.',
    achievement_image_url: 'https://example.com/glacier_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '62,63,64',
  },
  {
    achievement_name: 'Grand Canyon Park Conqueror',
    achievement_description: 'Hike all trails in Grand Canyon National Park.',
    achievement_image_url: 'https://example.com/grand_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '65,66,67',
  },
  {
    achievement_name: 'Grand Teton Park Conqueror',
    achievement_description: 'Hike all trails in Grand Teton National Park.',
    achievement_image_url: 'https://example.com/grand_teton_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '68,69,70',
  },
  {
    achievement_name: 'Great Basin Park Conqueror',
    achievement_description: 'Hike all trails in Great Basin National Park.',
    achievement_image_url: 'https://example.com/great_basin_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '71,72,73',
  },
  {
    achievement_name: 'Great Sand Dunes Park Conqueror',
    achievement_description:
      'Hike all trails in Great Sand Dunes National Park.',
    achievement_image_url:
      'https://example.com/great_sand_dunes_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '74,75,76',
  },
  {
    achievement_name: 'Great Smoky Mountains Park Conqueror',
    achievement_description:
      'Hike all trails in Great Smoky Mountains National Park.',
    achievement_image_url:
      'https://example.com/great_smoky_mountains_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '77,78',
  },
  {
    achievement_name: 'Guadalupe Mountains Park Conqueror',
    achievement_description:
      'Hike all trails in Guadalupe Mountains National Park.',
    achievement_image_url:
      'https://example.com/guadalupe_mountains_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '79,80,81',
  },
  {
    achievement_name: 'Haleakala Park Conqueror',
    achievement_description: 'Hike all trails in Haleakala National Park.',
    achievement_image_url: 'https://example.com/haleakala_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '82,83,84',
  },
  {
    achievement_name: 'Hawaii Volcanoes Park Conqueror',
    achievement_description:
      'Hike all trails in Hawaii Volcanoes National Park.',
    achievement_image_url:
      'https://example.com/hawaii_volcanoes_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '85,86,87',
  },
  {
    achievement_name: 'Hot Springs Park Conqueror',
    achievement_description: 'Hike all trails in Hot Springs National Park.',
    achievement_image_url: 'https://example.com/hot_springs_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '89,90,91',
  },
  {
    achievement_name: 'Yellowstone Park Conqueror',
    achievement_description: 'Hike all trails in Yellowstone National Park.',
    achievement_image_url: 'https://example.com/yellowstone_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '92,93,94',
  },
  {
    achievement_name: 'Yosemite Park Conqueror',
    achievement_description: 'Hike all trails in Yosemite National Park.',
    achievement_image_url: 'https://example.com/yosemite_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '95,96,97',
  },
  {
    achievement_name: 'Acadia Park Explorer',
    achievement_description: 'Hike all trails in Acadia National Park.',
    achievement_image_url: 'https://example.com/acadia_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:1,2,3',
  },
  {
    achievement_name: 'American Samoa Park Explorer',
    achievement_description: 'Hike all trails in American Samoa National Park.',
    achievement_image_url: 'https://example.com/american_samoa_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:4,5,6',
  },
  {
    achievement_name: 'Arches Park Explorer',
    achievement_description: 'Hike all trails in Arches National Park.',
    achievement_image_url: 'https://example.com/arches_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:7,8,9',
  },
  {
    achievement_name: 'Badlands Park Explorer',
    achievement_description: 'Hike all trails in Badlands National Park.',
    achievement_image_url: 'https://example.com/badlands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:10,11,12',
  },
  {
    achievement_name: 'Big Bend Park Explorer',
    achievement_description: 'Hike all trails in Big Bend National Park.',
    achievement_image_url: 'https://example.com/big_bend_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:13,14,15',
  },
  {
    achievement_name: 'Biscayne Park Explorer',
    achievement_description: 'Hike all trails in Biscayne National Park.',
    achievement_image_url: 'https://example.com/biscayne_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:16,17,18',
  },
  {
    achievement_name: 'Black Canyon of the Gunnison Park Explorer',
    achievement_description:
      'Hike all trails in Black Canyon of the Gunnison National Park.',
    achievement_image_url: 'https://example.com/black_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:19,20,21',
  },
  {
    achievement_name: 'Bryce Canyon Park Explorer',
    achievement_description: 'Hike all trails in Bryce Canyon National Park.',
    achievement_image_url: 'https://example.com/bryce_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:22,23,24',
  },
  {
    achievement_name: 'Canyonlands Park Explorer',
    achievement_description: 'Hike all trails in Canyonlands National Park.',
    achievement_image_url: 'https://example.com/canyonlands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:25,26,27',
  },
  {
    achievement_name: 'Capitol Reef Park Explorer',
    achievement_description: 'Hike all trails in Capitol Reef National Park.',
    achievement_image_url: 'https://example.com/capitol_reef_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:28,29,30',
  },
  {
    achievement_name: 'Carlsbad Caverns Park Explorer',
    achievement_description:
      'Hike all trails in Carlsbad Caverns National Park.',
    achievement_image_url:
      'https://example.com/carlsbad_caverns_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:31,32,33',
  },
  {
    achievement_name: 'Channel Islands Park Explorer',
    achievement_description:
      'Hike all trails in Channel Islands National Park.',
    achievement_image_url: 'https://example.com/channel_islands_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:34,35,36',
  },
  {
    achievement_name: 'Congaree Park Explorer',
    achievement_description: 'Hike all trails in Congaree National Park.',
    achievement_image_url: 'https://example.com/congaree_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:37,38,39',
  },
  {
    achievement_name: 'Crater Lake Park Explorer',
    achievement_description: 'Hike all trails in Crater Lake National Park.',
    achievement_image_url: 'https://example.com/crater_lake_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:40,41,42',
  },
  {
    achievement_name: 'Cuyahoga Valley Park Explorer',
    achievement_description:
      'Hike all trails in Cuyahoga Valley National Park.',
    achievement_image_url: 'https://example.com/cuyahoga_valley_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:43,44,45',
  },
  {
    achievement_name: 'Death Valley Park Explorer',
    achievement_description: 'Hike all trails in Death Valley National Park.',
    achievement_image_url: 'https://example.com/death_valley_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:46,47,48',
  },
  {
    achievement_name: 'Denali Park Explorer',
    achievement_description: 'Hike all trails in Denali National Park.',
    achievement_image_url: 'https://example.com/denali_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:49,50,51',
  },
  {
    achievement_name: 'Dry Tortugas Park Explorer',
    achievement_description: 'Hike all trails in Dry Tortugas National Park.',
    achievement_image_url: 'https://example.com/dry_tortugas_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:52,53',
  },
  {
    achievement_name: 'Everglades Park Explorer',
    achievement_description: 'Hike all trails in Everglades National Park.',
    achievement_image_url: 'https://example.com/everglades_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:54,55,56',
  },
  {
    achievement_name: 'Gates of the Arctic Park Explorer',
    achievement_description:
      'Hike all trails in Gates of the Arctic National Park.',
    achievement_image_url:
      'https://example.com/gates_of_the_arctic_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:57',
  },
  {
    achievement_name: 'Gateway Arch Park Explorer',
    achievement_description: 'Hike all trails in Gateway Arch National Park.',
    achievement_image_url: 'https://example.com/gateway_arch_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:58',
  },
  {
    achievement_name: 'Glacier Bay Park Explorer',
    achievement_description: 'Hike all trails in Glacier Bay National Park.',
    achievement_image_url: 'https://example.com/glacier_bay_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:59,60,61',
  },
  {
    achievement_name: 'Glacier Park Explorer',
    achievement_description: 'Hike all trails in Glacier National Park.',
    achievement_image_url: 'https://example.com/glacier_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:62,63,64',
  },
  {
    achievement_name: 'Grand Canyon Park Explorer',
    achievement_description: 'Hike all trails in Grand Canyon National Park.',
    achievement_image_url: 'https://example.com/grand_canyon_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:65,66,67',
  },
  {
    achievement_name: 'Grand Teton Park Explorer',
    achievement_description: 'Hike all trails in Grand Teton National Park.',
    achievement_image_url: 'https://example.com/grand_teton_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:68,69,70',
  },
  {
    achievement_name: 'Great Basin Park Explorer',
    achievement_description: 'Hike all trails in Great Basin National Park.',
    achievement_image_url: 'https://example.com/great_basin_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:71,72,73',
  },
  {
    achievement_name: 'Great Sand Dunes Park Explorer',
    achievement_description:
      'Hike all trails in Great Sand Dunes National Park.',
    achievement_image_url:
      'https://example.com/great_sand_dunes_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:74,75,76',
  },
  {
    achievement_name: 'Great Smoky Mountains Park Explorer',
    achievement_description:
      'Hike all trails in Great Smoky Mountains National Park.',
    achievement_image_url:
      'https://example.com/great_smoky_mountains_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:77,78',
  },
  {
    achievement_name: 'Guadalupe Mountains Park Explorer',
    achievement_description:
      'Hike all trails in Guadalupe Mountains National Park.',
    achievement_image_url:
      'https://example.com/guadalupe_mountains_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:79,80,81',
  },
  {
    achievement_name: 'Haleakala Park Explorer',
    achievement_description: 'Hike all trails in Haleakala National Park.',
    achievement_image_url: 'https://example.com/haleakala_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:82,83,84',
  },
  {
    achievement_name: 'Hawaii Volcanoes Park Explorer',
    achievement_description:
      'Hike all trails in Hawaii Volcanoes National Park.',
    achievement_image_url:
      'https://example.com/hawaii_volcanoes_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:85,86,87',
  },
  {
    achievement_name: 'Hot Springs Park Explorer',
    achievement_description: 'Hike all trails in Hot Springs National Park.',
    achievement_image_url: 'https://example.com/hot_springs_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:89,90,91',
  },
  {
    achievement_name: 'Yellowstone Park Explorer',
    achievement_description: 'Hike all trails in Yellowstone National Park.',
    achievement_image_url: 'https://example.com/yellowstone_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:92,93,94',
  },
  {
    achievement_name: 'Yosemite Park Explorer',
    achievement_description: 'Hike all trails in Yosemite National Park.',
    achievement_image_url: 'https://example.com/yosemite_completion.jpg',
    achievement_type: 'Park Completion',
    achievement_condition: '1:95,96,97',
  },
  {
    achievement_name: 'Maine State Completion',
    achievement_description: 'Hike all trails in Maine.',
    achievement_image_url: 'https://example.com/maine_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '1,2,3',
  },
  {
    achievement_name: 'American Samoa State Completion',
    achievement_description: 'Hike all trails in American Samoa.',
    achievement_image_url: 'https://example.com/american_samoa_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '4,5,6',
  },
  {
    achievement_name: 'Utah State Completion',
    achievement_description: 'Hike all trails in Utah.',
    achievement_image_url: 'https://example.com/utah_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '7,8,9,10,11,12,13,14,15,16,17,18',
  },
  {
    achievement_name: 'South Dakota State Completion',
    achievement_description: 'Hike all trails in South Dakota.',
    achievement_image_url: 'https://example.com/south_dakota_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '19,20,21',
  },
  {
    achievement_name: 'Texas State Completion',
    achievement_description: 'Hike all trails in Texas.',
    achievement_image_url: 'https://example.com/texas_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '22,23,24',
  },
  {
    achievement_name: 'Florida State Completion',
    achievement_description: 'Hike all trails in Florida.',
    achievement_image_url: 'https://example.com/florida_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '25,26,27',
  },
  {
    achievement_name: 'Colorado State Completion',
    achievement_description: 'Hike all trails in Colorado.',
    achievement_image_url: 'https://example.com/colorado_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '28,29,30,31,32,33',
  },
  {
    achievement_name: 'New Mexico State Completion',
    achievement_description: 'Hike all trails in New Mexico.',
    achievement_image_url: 'https://example.com/new_mexico_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '34,35,36',
  },
  {
    achievement_name: 'California State Completion',
    achievement_description: 'Hike all trails in California.',
    achievement_image_url: 'https://example.com/california_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '37,38,39,40,41,42,43,44,45',
  },
  {
    achievement_name: 'Oregon State Completion',
    achievement_description: 'Hike all trails in Oregon.',
    achievement_image_url: 'https://example.com/oregon_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '46,47,48',
  },
  {
    achievement_name: 'Ohio State Completion',
    achievement_description: 'Hike all trails in Ohio.',
    achievement_image_url: 'https://example.com/ohio_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '49,50,51',
  },
  {
    achievement_name: 'Nevada State Completion',
    achievement_description: 'Hike all trails in Nevada.',
    achievement_image_url: 'https://example.com/nevada_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '52,53,54,55,56,57',
  },
  {
    achievement_name: 'Alaska State Completion',
    achievement_description: 'Hike all trails in Alaska.',
    achievement_image_url: 'https://example.com/alaska_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '58,59,60,61',
  },
  {
    achievement_name: 'Missouri State Completion',
    achievement_description: 'Hike all trails in Missouri.',
    achievement_image_url: 'https://example.com/missouri_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '62',
  },
  {
    achievement_name: 'Tennessee State Completion',
    achievement_description: 'Hike all trails in Tennessee.',
    achievement_image_url: 'https://example.com/tennessee_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '63,64',
  },
  {
    achievement_name: 'Arkansas State Completion',
    achievement_description: 'Hike all trails in Arkansas.',
    achievement_image_url: 'https://example.com/arkansas_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '65,66,67',
  },
  {
    achievement_name: 'Hawaii State Completion',
    achievement_description: 'Hike all trails in Hawaii.',
    achievement_image_url: 'https://example.com/hawaii_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '68,69,70,71',
  },
  {
    achievement_name: 'Montana State Completion',
    achievement_description: 'Hike all trails in Montana.',
    achievement_image_url: 'https://example.com/montana_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '72,73,74',
  },
  {
    achievement_name: 'Wyoming State Completion',
    achievement_description: 'Hike all trails in Wyoming.',
    achievement_image_url: 'https://example.com/wyoming_completion.jpg',
    achievement_type: 'State Completion',
    achievement_condition: '75,76,77',
  },
  {
    achievement_name: 'Top of the Mountain',
    achievement_description: 'Reach the number one spot on the leaderboard.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '1',
  },
  {
    achievement_name: 'Peak Performer',
    achievement_description:
      'Consistently rank in the top three on the leaderboard.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '1:3',
  },
  {
    achievement_name: 'High Achiever',
    achievement_description:
      'Maintain a position in the top ten on the leaderboard.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '1:10',
  },
  {
    achievement_name: 'On the Rise',
    achievement_description:
      'Make significant progress on the leaderboard, moving up at least 100 places.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '100',
  },
  {
    achievement_name: 'Steady Climber',
    achievement_description:
      'Gradually improve your ranking on the leaderboard, moving up at least 50 places.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '50',
  },
  {
    achievement_name: 'Consistent Contender',
    achievement_description:
      'Maintain a consistent ranking on the leaderboard for a month.',
    achievement_image_url: '',
    achievement_type: 'Leaderboard',
    achievement_condition: '30 days',
  },
  {
    achievement_name: 'First Steps',
    achievement_description: 'Unlocked at 1.0 mile of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '1.0',
    achievement_fact: '',
  },
  {
    achievement_name: '007',
    achievement_description: 'Earned after hiking 0.07 miles.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '0.07',
    achievement_fact: '',
  },
  {
    achievement_name: '420',
    achievement_description: 'Unlocked at 4.20 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '4.20',
    achievement_fact: '',
  },
  {
    achievement_name: 'Police',
    achievement_description: 'Achieved after completing 12 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '12.0',
    achievement_fact: '',
  },
  {
    achievement_name: 'Lucky Charms',
    achievement_description: 'Earned at 7.77 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '7.77',
    achievement_fact: '',
  },
  {
    achievement_name: 'National Pie Day',
    achievement_description: 'Unlocked at 3.14 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '3.14',
    achievement_fact: '',
  },
  {
    achievement_name: 'BooB',
    achievement_description: 'Unlocked at 80.08 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '80.08',
    achievement_fact: '',
  },
  {
    achievement_name: 'Threes a Crowd',
    achievement_description: 'Earned at 33.3 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '33.3',
    achievement_fact: '',
  },
  {
    achievement_name: 'Marathoner',
    achievement_description: 'Just getting warmed up!',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '26.2',
    achievement_fact: '',
  },
  {
    achievement_name: 'High Five',
    achievement_description: 'Unlocked at 5.55 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '5.55',
  },
  {
    achievement_name: 'Lucky 13',
    achievement_description: 'Earned at 13.13 miles of hiking.',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '13.13',
  },
  {
    achievement_name: 'First Park',
    achievement_description:
      'Earned after hiking the equivalent distance to the oldest National Park, Yellowstone, established in 1872 (18.72 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '18.72',
  },
  {
    achievement_name: '63 Club',
    achievement_description:
      'Unlocked after hiking the equivalent of the total number of National Parks in the United States (63 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '63.0',
  },
  {
    achievement_name: 'Lone Star',
    achievement_description:
      'Unlocked after hiking the equivalent distance to the total area of Big Bend National Park in acres (801,163 acres = 801.163 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '80.163',
  },
  {
    achievement_name: 'High Tide',
    achievement_description:
      'Earned after hiking the distance to the highest point in Death Valley National Park, Telescope Peak, which stands at 11,043 feet (11,043 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '110.43',
  },
  {
    achievement_name: 'Golden Gate',
    achievement_description:
      'Unlocked at the distance equivalent to the length of the Golden Gate Bridge in San Francisco (8,981 feet = 8.981 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '8.981',
  },
  {
    achievement_name: 'Grizzly',
    achievement_description:
      'Earned after hiking the distance equivalent to the average weight of a grizzly bear, 600 pounds (600 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '600',
  },
  {
    achievement_name: 'Centennial',
    achievement_description:
      'Unlocked after hiking the equivalent distance to the age of Grand Canyon National Park in years (100 years = 100 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '100',
  },
  {
    achievement_name: 'Evergreen',
    achievement_description:
      'Earned after hiking the distance equivalent to the height of the tallest tree in Redwood National Park, Hyperion, which stands at 379.7 feet (379.7 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '379.7',
  },
  {
    achievement_name: 'Canyon Depths',
    achievement_description:
      'Unlocked at the distance equivalent to the depth of the Grand Canyon at its deepest point, 6,093 feet (6,093 miles).',
    achievement_image_url: '',
    achievement_type: 'Total Miles',
    achievement_condition: '60.93',
  },
  {
    achievement_name: 'Trail Blazer',
    achievement_description:
      'Take your first steps on the path to greatness with a 15-minute session.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '900',
  },
  {
    achievement_name: 'Explorer',
    achievement_description:
      'Embark on a 30-minute journey to discover new horizons.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '1800',
  },
  {
    achievement_name: 'Adventurer',
    achievement_description:
      'Venture further into the wilderness with a 1-hour session.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '3600',
  },
  {
    achievement_name: 'Mountaineer',
    achievement_description:
      'Reach new heights of endurance and focus with a 90-minute session.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '5400',
  },
  {
    achievement_name: 'Trail Master',
    achievement_description:
      'Conquer the trails with a 2-hour session, showing true dedication and determination.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '7200',
  },
  {
    achievement_name: 'Ultimate Explorer',
    achievement_description:
      'Embark on an epic 3-hour journey, pushing the limits of endurance and adventure.',
    achievement_image_url: '',
    achievement_type: 'User Session Duration',
    achievement_condition: '10800',
  },
  {
    achievement_name: 'First Driving',
    achievement_description:
      "Embarked on your driving journey with the first session in the 'Driving' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Driving',
  },
  {
    achievement_name: 'Road Warrior',
    achievement_description: "Logged 5 sessions in the 'Driving' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Driving',
  },
  {
    achievement_name: 'First Errands',
    achievement_description:
      "Completed your first session categorized as 'Errands'.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Errands',
  },
  {
    achievement_name: 'Errands Expert',
    achievement_description:
      "Managed your tasks efficiently with 5 sessions in the 'Errands' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Errands',
  },
  {
    achievement_name: 'First Family Time',
    achievement_description:
      "Enjoyed precious moments with the first session in the 'Family' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Family',
  },
  {
    achievement_name: 'Family Bonding',
    achievement_description:
      "Strengthened family ties with 5 sessions in the 'Family' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Family',
  },
  {
    achievement_name: 'First Meditating',
    achievement_description:
      "Initiated your journey to mindfulness with the first session in the 'Meditating' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Meditating',
  },
  {
    achievement_name: 'Zen Master',
    achievement_description:
      "Reached a state of tranquility with 5 sessions in the 'Meditating' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Meditating',
  },
  {
    achievement_name: 'First Other',
    achievement_description:
      "Engaged in miscellaneous activities with the first session in the 'Other' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Other',
  },
  {
    achievement_name: 'Jack of All Trades',
    achievement_description:
      "Explored diverse activities with 5 sessions in the 'Other' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Other',
  },
  {
    achievement_name: 'First Outdoors',
    achievement_description:
      "Embraced the great outdoors with the first session in the 'Outdoors' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Outdoors',
  },
  {
    achievement_name: 'Nature Enthusiast',
    achievement_description:
      "Immersed yourself in nature with 5 sessions in the 'Outdoors' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Outdoors',
  },
  {
    achievement_name: 'First Pets',
    achievement_description:
      "Bonded with your furry friends with the first session in the 'Pets' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Pets',
  },
  {
    achievement_name: 'Animal Lover',
    achievement_description:
      "Cared for your pets with 5 sessions in the 'Pets' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Pets',
  },
  {
    achievement_name: 'First Reading',
    achievement_description:
      "Embarked on literary adventures with the first session in the 'Reading' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Reading',
  },
  {
    achievement_name: 'Bookworm',
    achievement_description:
      "Indulged in reading escapades with 5 sessions in the 'Reading' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Reading',
  },
  {
    achievement_name: 'First Socializing',
    achievement_description:
      "Initiated social interactions with the first session in the 'Social' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Social',
  },
  {
    achievement_name: 'Social Butterfly',
    achievement_description:
      "Fostered connections with 5 sessions in the 'Social' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Social',
  },
  {
    achievement_name: 'First Sports',
    achievement_description:
      "Embarked on sporting adventures with the first session in the 'Sports' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Sports',
  },
  {
    achievement_name: 'Sports Enthusiast',
    achievement_description:
      "Pursued your athletic passions with 5 sessions in the 'Sports' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Sports',
  },
  {
    achievement_name: 'First Study',
    achievement_description:
      "Embarked on the quest for knowledge with the first session in the 'Study' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Study',
  },
  {
    achievement_name: 'Scholar',
    achievement_description:
      "Expanded your mind with 5 sessions in the 'Study' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Study',
  },
  {
    achievement_name: 'First Work',
    achievement_description:
      "Took the first step towards professional success with the first session in the 'Work' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Work',
  },
  {
    achievement_name: 'Workaholic',
    achievement_description:
      "Dedicated yourself to productivity with 5 sessions in the 'Work' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Work',
  },
  {
    achievement_name: 'First Workout',
    achievement_description:
      "Embarked on your fitness journey with the first session in the 'Workout' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Workout',
  },
  {
    achievement_name: 'Fitness Fanatic',
    achievement_description:
      "Embraced a healthy lifestyle with 5 sessions in the 'Workout' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Workout',
  },
  {
    achievement_name: 'First Writing',
    achievement_description:
      "Embarked on a literary adventure with the first session in the 'Writing' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Writing',
  },
  {
    achievement_name: 'Wordsmith',
    achievement_description:
      "Crafted your thoughts into words with 5 sessions in the 'Writing' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Writing',
  },
  {
    achievement_name: 'First Yoga',
    achievement_description:
      "Embarked on your yoga journey with the first session in the 'Yoga' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '1:Yoga',
  },
  {
    achievement_name: 'Yogi',
    achievement_description:
      "Found inner peace with 5 sessions in the 'Yoga' category.",
    achievement_image_url: '',
    achievement_type: 'User Session Category',
    achievement_condition: '5:Yoga',
  },
  {
    achievement_name: 'John Muir',
    achievement_description:
      'Embark on your outdoor journey with a session named after John Muir, the renowned naturalist and conservationist.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'John Muir',
  },
  {
    achievement_name: 'Ansel Adams',
    achievement_description:
      'Capture the beauty of the outdoors with a session named after Ansel Adams, the legendary landscape photographer.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'Ansel Adams',
  },
  {
    achievement_name: 'Edward Abbey',
    achievement_description:
      'Find adventure and activism in the wilderness with a session named after Edward Abbey, the passionate environamentalist and author.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'Edward Abbey',
  },
  {
    achievement_name: 'Reinhold Messner',
    achievement_description:
      'Embark on high-altitude adventures with a session named after Reinhold Messner, the legendary mountaineer and adventurer.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'Reinhold Messner',
  },
  {
    achievement_name: 'Jane Goodall',
    achievement_description:
      'Connect with nature and wildlife with a session named after Jane Goodall, the renowned primatologist and conservationist.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'Jane Goodall',
  },
  {
    achievement_name: 'Yvon Chouinard',
    achievement_description:
      'Embrace outdoor ethics and sustainable living with a session named after Yvon Chouinard, the founder of Patagonia and environamental activist.',
    achievement_image_url: '',
    achievement_type: 'User Session Name',
    achievement_condition: 'Yvon Chouinard',
  },
  {
    achievement_name: 'Focused Explorer',
    achievement_description:
      'Stay on track with no strikes during a single session.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '0',
  },
  {
    achievement_name: 'Resilient Hiker',
    achievement_description:
      'Overcome distractions and obstacles with only 1 strike during a session.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '1',
  },
  {
    achievement_name: 'Persevering Adventurer',
    achievement_description:
      'Show your determination by completing a session with 2 strikes.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '2',
  },
  {
    achievement_name: 'Focused Trailblazer',
    achievement_description:
      'Navigate challenges with 3 strikes during a single session.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '3',
  },
  {
    achievement_name: 'Resolute Wanderer',
    achievement_description:
      'Demonstrate your resolve by completing a session with 4 strikes.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '4',
  },
  {
    achievement_name: 'Persistent Voyager',
    achievement_description:
      'Never give up! Finish a session despite 5 strikes.',
    achievement_image_url: '',
    achievement_type: 'User Session Strikes',
    achievement_condition: '5',
  },
  {
    achievement_name: 'Trailblazer Apprentice',
    achievement_description:
      'Embark on 1 trail spanning between 1 and 3 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:1,3',
  },
  {
    achievement_name: 'Ranger Initiate',
    achievement_description:
      'Begin your journey with 3 trails, each between 1 and 3 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:1,3',
  },
  {
    achievement_name: 'Discovery Novice',
    achievement_description:
      'Discover 5 new trails, each spanning between 1 and 3 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:1,3',
  },
  {
    achievement_name: 'Explorer Apprentice',
    achievement_description:
      'Embark on 1 trail spanning between 3 and 5 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:3,5',
  },
  {
    achievement_name: 'Ranger Novice',
    achievement_description:
      'Begin your journey with 3 trails, each between 3 and 5 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:3,5',
  },
  {
    achievement_name: 'Pathfinder Initiate',
    achievement_description:
      'Discover 5 new trails, each spanning between 3 and 5 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:3,5',
  },
  {
    achievement_name: 'Adventurer Apprentice',
    achievement_description:
      'Embark on 1 trail spanning between 5 and 7 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:5,7',
  },
  {
    achievement_name: 'Pioneer Initiate',
    achievement_description:
      'Begin your journey with 3 trails, each between 5 and 7 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:5,7',
  },
  {
    achievement_name: 'Explorer Novice',
    achievement_description:
      'Discover 5 new trails, each spanning between 5 and 7 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:5,7',
  },
  {
    achievement_name: 'Voyager Apprentice',
    achievement_description:
      'Embark on 1 trail spanning between 7 and 10 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:7,10',
  },
  {
    achievement_name: 'Pioneer Novice',
    achievement_description:
      'Begin your journey with 3 trails, each between 7 and 10 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:7,10',
  },
  {
    achievement_name: 'Navigator Initiate',
    achievement_description:
      'Discover 5 new trails, each spanning between 7 and 10 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:7,10',
  },
  {
    achievement_name: 'Explorer Journeyman',
    achievement_description:
      'Embark on 1 trail spanning between 10 and 13 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:10,13',
  },
  {
    achievement_name: 'Pathfinder Novice',
    achievement_description:
      'Begin your journey with 3 trails, each between 10 and 13 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:10,13',
  },
  {
    achievement_name: 'Adventurer Journeyman',
    achievement_description:
      'Discover 5 new trails, each spanning between 10 and 13 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:10,13',
  },
  {
    achievement_name: 'Explorer Master',
    achievement_description:
      'Embark on 1 trail spanning between 13 and 16 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:13,16',
  },
  {
    achievement_name: 'Voyager Novice',
    achievement_description:
      'Begin your journey with 3 trails, each between 13 and 16 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:13,16',
  },
  {
    achievement_name: 'Pioneer Journeyman',
    achievement_description:
      'Discover 5 new trails, each spanning between 13 and 16 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:13,16',
  },
  {
    achievement_name: 'Adventurer Master',
    achievement_description:
      'Embark on 1 trail spanning between 16 and 20 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '1:16,20',
  },
  {
    achievement_name: 'Navigator Novice',
    achievement_description:
      'Begin your journey with 3 trails, each between 16 and 20 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '3:16,20',
  },
  {
    achievement_name: 'Explorer Grandmaster',
    achievement_description:
      'Discover 5 new rails, each spanning between 16 and 20 miles.',
    achievement_image_url: '',
    achievement_type: 'Trail Distance',
    achievement_condition: '5:16,20',
  },
];
export default masterAchievementList;
