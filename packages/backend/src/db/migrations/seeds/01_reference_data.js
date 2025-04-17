/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Truncate all tables to ensure clean data
    await knex.raw('TRUNCATE TABLE roles CASCADE');
    await knex.raw('TRUNCATE TABLE professional_types CASCADE');
    await knex.raw('TRUNCATE TABLE permissions CASCADE');
    await knex.raw('TRUNCATE TABLE gemstone_families CASCADE');
    await knex.raw('TRUNCATE TABLE cut_shapes CASCADE');
    await knex.raw('TRUNCATE TABLE colors CASCADE');
    await knex.raw('TRUNCATE TABLE color_grades CASCADE');
    await knex.raw('TRUNCATE TABLE clarity_grades CASCADE');
    await knex.raw('TRUNCATE TABLE mining_locations CASCADE');
    
    // Insert roles
    await knex('roles').insert([
      { name: 'customer', description: 'Regular user who can buy gemstones and jewelry' },
      { name: 'dealer', description: 'Professional who can sell gemstones and jewelry' },
      { name: 'cutter', description: 'Professional who can cut rough stones into gemstones' },
      { name: 'appraiser', description: 'Professional who can appraise and certify gemstones' },
      { name: 'admin', description: 'System administrator' }
    ]);
  
    // Insert professional types
    await knex('professional_types').insert([
      { name: 'dealer', description: 'Buys and sells gemstones and jewelry' },
      { name: 'cutter', description: 'Specializes in cutting and polishing rough stones' },
      { name: 'appraiser', description: 'Evaluates and certifies gemstones' }
    ]);
  
    // Insert permissions
    const permissions = [
      { name: 'user:read', description: 'View user information' },
      { name: 'user:write', description: 'Edit user information' },
      { name: 'gemstone:read', description: 'View gemstone information' },
      { name: 'gemstone:write', description: 'Edit gemstone information' },
      { name: 'gemstone:delete', description: 'Delete gemstone entries' },
      { name: 'rough-stone:read', description: 'View rough stone information' },
      { name: 'rough-stone:write', description: 'Edit rough stone information' },
      { name: 'rough-stone:delete', description: 'Delete rough stone entries' },
      { name: 'professional:verify', description: 'Verify professional accounts' },
      { name: 'admin:access', description: 'Access admin functionality' }
    ];
    
    await knex('permissions').insert(permissions);
    
    // Get role and permission IDs
    const rolesResult = await knex('roles').select('id', 'name');
    const permissionsResult = await knex('permissions').select('id', 'name');
    
    const roleMap = {};
    rolesResult.forEach(role => {
      roleMap[role.name] = role.id;
    });
    
    const permissionMap = {};
    permissionsResult.forEach(permission => {
      permissionMap[permission.name] = permission.id;
    });
    
    // Role permissions mapping
    const rolePermissions = [
      { role: 'customer', permissions: ['user:read', 'gemstone:read', 'rough-stone:read'] },
      { role: 'dealer', permissions: ['user:read', 'gemstone:read', 'gemstone:write', 'rough-stone:read', 'rough-stone:write'] },
      { role: 'cutter', permissions: ['user:read', 'gemstone:read', 'gemstone:write', 'rough-stone:read', 'rough-stone:write'] },
      { role: 'appraiser', permissions: ['user:read', 'gemstone:read', 'gemstone:write', 'rough-stone:read'] },
      { role: 'admin', permissions: ['user:read', 'user:write', 'gemstone:read', 'gemstone:write', 'gemstone:delete', 
                                   'rough-stone:read', 'rough-stone:write', 'rough-stone:delete', 'professional:verify', 'admin:access'] }
    ];
    
    // Insert role permissions
    const rolePermissionsData = [];
    rolePermissions.forEach(rp => {
      rp.permissions.forEach(permission => {
        rolePermissionsData.push({
          role_id: roleMap[rp.role],
          permission_id: permissionMap[permission]
        });
      });
    });
    
    await knex('role_permissions').insert(rolePermissionsData);
    
    // Insert gemstone families
    await knex('gemstone_families').insert([
      {
        name: 'Diamond',
        category: 'Native Element',
        description: 'Diamonds are the hardest known natural material and one of the most popular gemstones.',
        hardness_min: 10.0,
        hardness_max: 10.0,
        chemical_formula: 'C',
        crystal_system: 'Cubic',
        refractive_index_min: 2.417,
        refractive_index_max: 2.419,
        specific_gravity_min: 3.50,
        specific_gravity_max: 3.53,
        cleavage: 'Perfect octahedral',
        luster: 'Adamantine'
      },
      {
        name: 'Ruby',
        category: 'Oxide',
        description: 'Ruby is a pink to blood-red colored gemstone, a variety of the mineral corundum (aluminum oxide).',
        hardness_min: 9.0,
        hardness_max: 9.0,
        chemical_formula: 'Al₂O₃',
        crystal_system: 'Hexagonal',
        refractive_index_min: 1.762,
        refractive_index_max: 1.770,
        specific_gravity_min: 3.97,
        specific_gravity_max: 4.05,
        cleavage: 'None',
        luster: 'Vitreous to adamantine'
      },
      {
        name: 'Sapphire',
        category: 'Oxide',
        description: 'Sapphires are gemstones that are formed from corundum and come in many colors, though blue is most common.',
        hardness_min: 9.0,
        hardness_max: 9.0,
        chemical_formula: 'Al₂O₃',
        crystal_system: 'Hexagonal',
        refractive_index_min: 1.762,
        refractive_index_max: 1.770,
        specific_gravity_min: 3.95,
        specific_gravity_max: 4.03,
        cleavage: 'None',
        luster: 'Vitreous to adamantine'
      },
      {
        name: 'Emerald',
        category: 'Silicate',
        description: 'Emerald is a variety of beryl colored green by trace amounts of chromium and sometimes vanadium.',
        hardness_min: 7.5,
        hardness_max: 8.0,
        chemical_formula: 'Be₃Al₂(SiO₃)₆',
        crystal_system: 'Hexagonal',
        refractive_index_min: 1.565,
        refractive_index_max: 1.599,
        specific_gravity_min: 2.67,
        specific_gravity_max: 2.78,
        cleavage: 'Imperfect basal',
        luster: 'Vitreous'
      },
      {
        name: 'Amethyst',
        category: 'Silicate',
        description: 'Amethyst is a violet variety of quartz often used in jewelry.',
        hardness_min: 7.0,
        hardness_max: 7.0,
        chemical_formula: 'SiO₂',
        crystal_system: 'Hexagonal',
        refractive_index_min: 1.544,
        refractive_index_max: 1.553,
        specific_gravity_min: 2.63,
        specific_gravity_max: 2.65,
        cleavage: 'None',
        luster: 'Vitreous'
      }
    ]);
    
    // Insert cut shapes (limited selection for seed data)
    await knex('cut_shapes').insert([
      {
        name: 'Round Brilliant',
        category: 'Faceted',
        description: 'The standard round brilliant cut is the most common and popular diamond cut.',
        image_url: '/assets/images/cuts/round-brilliant.png'
      },
      {
        name: 'Princess',
        category: 'Faceted',
        description: 'The princess cut is the second most popular cut for diamonds. It is a square version of the brilliant cut.',
        image_url: '/assets/images/cuts/princess.png'
      },
      {
        name: 'Emerald',
        category: 'Step Cut',
        description: 'The emerald cut is a step cut with elongated shape, large open table, and straight linear facets.',
        image_url: '/assets/images/cuts/emerald.png'
      },
      {
        name: 'Standard Cabochon',
        category: 'Cabochon',
        description: 'A cabochon is a stone that is shaped and polished with a flat bottom and domed top, without faceting.',
        image_url: '/assets/images/cuts/std-cabochon.png'
      }
    ]);
    
    // Insert colors (limited selection for seed data)
    await knex('colors').insert([
      { name: 'red', display_name: 'Red', hex_code: '#ff0000', category: 'Red' },
      { name: 'ruby-red', display_name: 'Ruby Red', hex_code: '#e0115f', category: 'Red' },
      { name: 'pink', display_name: 'Pink', hex_code: '#ffc0cb', category: 'Pink' },
      { name: 'emerald-green', display_name: 'Emerald Green', hex_code: '#50c878', category: 'Green' },
      { name: 'sapphire-blue', display_name: 'Sapphire Blue', hex_code: '#0f52ba', category: 'Blue' },
      { name: 'amethyst', display_name: 'Amethyst', hex_code: '#9966cc', category: 'Purple' },
      { name: 'colorless', display_name: 'Colorless', hex_code: '#f8f8ff', category: 'White' }
    ]);
    
    // Insert color grades
    await knex('color_grades').insert([
      { grade: 'AAA', description: 'Top quality, best color and clarity for the stone type' },
      { grade: 'AA', description: 'High quality, excellent color and clarity' },
      { grade: 'A', description: 'Good quality, good color and clarity' },
      { grade: 'B', description: 'Fair quality, acceptable color and clarity' },
      { grade: 'C', description: 'Low quality, poor color and clarity' }
    ]);
    
    // Insert clarity grades (both diamond and colored stone scales)
    const diamondClarityGrades = [
      { grade: 'FL', description: 'Flawless - No inclusions or blemishes visible under 10x magnification', category: 'Diamond' },
      { grade: 'IF', description: 'Internally Flawless - No inclusions visible under 10x magnification, only small blemishes on the surface', category: 'Diamond' },
      { grade: 'VVS1', description: 'Very, Very Slightly Included 1 - Inclusions so slight they are difficult for a skilled grader to see under 10x magnification', category: 'Diamond' },
      { grade: 'VVS2', description: 'Very, Very Slightly Included 2 - Inclusions difficult for a skilled grader to see under 10x magnification', category: 'Diamond' },
      { grade: 'VS1', description: 'Very Slightly Included 1 - Inclusions difficult to see under 10x magnification', category: 'Diamond' },
      { grade: 'VS2', description: 'Very Slightly Included 2 - Inclusions somewhat easy to see under 10x magnification', category: 'Diamond' }
    ];
    
    const coloredStoneClarityGrades = [
      { grade: 'Loupe Clean', description: 'No inclusions visible under 10x magnification', category: 'Colored Stone' },
      { grade: 'Eye Clean', description: 'No inclusions visible to the naked eye, but visible under magnification', category: 'Colored Stone' },
      { grade: 'Slightly Included', description: 'Minor inclusions visible to the naked eye upon close inspection', category: 'Colored Stone' },
      { grade: 'Moderately Included', description: 'Noticeable inclusions visible to the naked eye', category: 'Colored Stone' }
    ];
    
    await knex('clarity_grades').insert([...diamondClarityGrades, ...coloredStoneClarityGrades]);
    
    // Insert mining locations (limited selection for seed data)
    await knex('mining_locations').insert([
      {
        name: 'Kimberley',
        country: 'South Africa',
        region: 'Northern Cape',
        locality: 'Kimberley',
        latitude: -28.7282,
        longitude: 24.7499,
        description: 'Historic diamond mining region, home to the Big Hole'
      },
      {
        name: 'Mogok',
        country: 'Myanmar',
        region: 'Mandalay Region',
        locality: 'Mogok',
        latitude: 22.9177,
        longitude: 96.5079,
        description: 'Historic source of fine rubies, known as "Pigeon\'s Blood" rubies'
      },
      {
        name: 'Muzo',
        country: 'Colombia',
        region: 'Boyacá Department',
        locality: 'Muzo',
        latitude: 5.5322,
        longitude: -74.1040,
        description: 'Produces some of the finest emeralds in the world'
      }
    ]);
  };