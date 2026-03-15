import { db } from "./index";
import { statesTable } from "./schema";

async function seedStates() {
  await db.insert(statesTable).values([
    { name: "Andhra Pradesh", code: "AP" },
    { name: "Arunachal Pradesh", code: "AR" },
    { name: "Assam", code: "AS" },
    { name: "Bihar", code: "BR" },
    { name: "Chhattisgarh", code: "CG" },
    { name: "Goa", code: "GA" },
    { name: "Gujarat", code: "GJ" },
    { name: "Haryana", code: "HR" },
    { name: "Himachal Pradesh", code: "HP" },
    { name: "Jharkhand", code: "JH" },
    { name: "Karnataka", code: "KA" },
    { name: "Kerala", code: "KL" },
    { name: "Madhya Pradesh", code: "MP" },
    { name: "Maharashtra", code: "MH" }
  ]);

  console.log("States seeded successfully");
}

seedStates();

const districtSeed = `
INSERT INTO districts (name, state_id) VALUES
-- Andhra Pradesh (1)
('Visakhapatnam',1),('East Godavari',1),('West Godavari',1),('Krishna',1),('Guntur',1),
('Prakasam',1),('Nellore',1),('Kurnool',1),('Kadapa',1),('Chittoor',1),('Anantapur',1),('Srikakulam',1),
-- Arunachal Pradesh (2)
('Itanagar',2),('Tawang',2),('West Kameng',2),('East Kameng',2),('Papum Pare',2),('Upper Subansiri',2),
-- Assam (3)
('Kamrup Metro',3),('Kamrup',3),('Sonitpur',3),('Dibrugarh',3),('Jorhat',3),('Nagaon',3),('Cachar',3),('Barpeta',3),('Golaghat',3),('Lakhimpur',3),
-- Bihar (4)
('Patna',4),('Gaya',4),('Muzaffarpur',4),('Bhagalpur',4),('Darbhanga',4),('Purnia',4),('Munger',4),('Begusarai',4),('Nalanda',4),('Vaishali',4),('Sitamarhi',4),('Saran',4),
-- Chhattisgarh (5)
('Raipur',5),('Bilaspur',5),('Durg',5),('Korba',5),('Rajnandgaon',5),('Raigarh',5),('Surguja',5),('Jagdalpur',5),('Mahasamund',5),('Janjgir-Champa',5),
-- Goa (6)
('North Goa',6),('South Goa',6),
-- Gujarat (7)
('Ahmedabad',7),('Surat',7),('Vadodara',7),('Rajkot',7),('Gandhinagar',7),('Jamnagar',7),('Bhavnagar',7),('Anand',7),('Kutch',7),('Mehsana',7),
-- Haryana (8)
('Faridabad',8),('Gurgaon',8),('Panipat',8),('Ambala',8),('Hisar',8),('Rohtak',8),('Karnal',8),('Sonipat',8),('Yamunanagar',8),('Panchkula',8),
-- Himachal Pradesh (9)
('Shimla',9),('Kangra',9),('Mandi',9),('Solan',9),('Kullu',9),('Hamirpur',9),('Una',9),
-- Jharkhand (10)
('Ranchi',10),('Dhanbad',10),('Jamshedpur',10),('Hazaribagh',10),('Bokaro',10),('Deoghar',10),('Dumka',10),('Giridih',10),
-- Karnataka (11)
('Bengaluru Urban',11),('Mysuru',11),('Hubballi-Dharwad',11),('Mangaluru',11),('Belagavi',11),('Kalaburagi',11),('Ballari',11),('Vijayapura',11),('Shivamogga',11),('Tumkur',11),('Raichur',11),('Hassan',11),
-- Kerala (12)
('Thiruvananthapuram',12),('Ernakulam',12),('Kozhikode',12),('Thrissur',12),('Kollam',12),('Kannur',12),('Malappuram',12),('Palakkad',12),('Alappuzha',12),('Kottayam',12),
-- Madhya Pradesh (13)
('Bhopal',13),('Indore',13),('Jabalpur',13),('Gwalior',13),('Ujjain',13),('Sagar',13),('Rewa',13),('Satna',13),('Dewas',13),('Chhindwara',13),('Ratlam',13),('Vidisha',13),
-- Maharashtra (14)
('Mumbai',14),('Pune',14),('Nagpur',14),('Nashik',14),('Aurangabad',14),('Solapur',14),('Thane',14),('Kolhapur',14),('Amravati',14),('Nanded',14),('Ahmednagar',14),('Jalgaon',14),
-- Manipur (15)
('Imphal West',15),('Imphal East',15),('Thoubal',15),('Bishnupur',15),
-- Meghalaya (16)
('East Khasi Hills',16),('West Khasi Hills',16),('Ri Bhoi',16),('East Jaintia Hills',16),
-- Mizoram (17)
('Aizawl',17),('Lunglei',17),('Champhai',17),
-- Nagaland (18)
('Kohima',18),('Dimapur',18),('Mokokchung',18),
-- Odisha (19)
('Bhubaneswar',19),('Cuttack',19),('Rourkela',19),('Berhampur',19),('Sambalpur',19),('Puri',19),('Balasore',19),('Jharsuguda',19),('Koraput',19),('Kendujhar',19),
-- Punjab (20)
('Ludhiana',20),('Amritsar',20),('Jalandhar',20),('Patiala',20),('Bathinda',20),('Mohali',20),('Gurdaspur',20),('Hoshiarpur',20),('Pathankot',20),
-- Rajasthan (21)
('Jaipur',21),('Jodhpur',21),('Kota',21),('Bikaner',21),('Ajmer',21),('Alwar',21),('Bharatpur',21),('Udaipur',21),('Sikar',21),('Bhilwara',21),('Sriganganagar',21),('Pali',21),
-- Sikkim (22)
('East Sikkim',22),('West Sikkim',22),('North Sikkim',22),('South Sikkim',22),
-- Tamil Nadu (23)
('Chennai',23),('Coimbatore',23),('Madurai',23),('Tiruchirappalli',23),('Salem',23),('Tirunelveli',23),('Vellore',23),('Erode',23),('Tiruppur',23),('Thoothukudi',23),('Kanchipuram',23),('Thanjavur',23),
-- Telangana (24)
('Hyderabad',24),('Warangal',24),('Nizamabad',24),('Khammam',24),('Karimnagar',24),('Rangareddy',24),('Nalgonda',24),('Sangareddy',24),('Medchal',24),
-- Tripura (25)
('West Tripura',25),('South Tripura',25),('North Tripura',25),('Dhalai',25),
-- Uttar Pradesh (26)
('Lucknow',26),('Kanpur',26),('Agra',26),('Varanasi',26),('Meerut',26),('Allahabad',26),('Ghaziabad',26),('Noida',26),('Bareilly',26),('Aligarh',26),('Gorakhpur',26),('Moradabad',26),('Firozabad',26),('Mathura',26),('Muzaffarnagar',26),('Saharanpur',26),
-- Uttarakhand (27)
('Dehradun',27),('Haridwar',27),('Nainital',27),('Udham Singh Nagar',27),('Almora',27),('Tehri Garhwal',27),('Pauri Garhwal',27),
-- West Bengal (28)
('Kolkata',28),('Howrah',28),('North 24 Parganas',28),('South 24 Parganas',28),('Bardhaman',28),('Murshidabad',28),('Nadia',28),('Hooghly',28),('Jalpaiguri',28),('Cooch Behar',28),
-- Andaman and Nicobar (29)
('South Andaman',29),('North and Middle Andaman',29),('Nicobar',29),
-- Chandigarh (30)
('Chandigarh',30),
-- Dadra and Nagar Haveli (31)
('Dadra and Nagar Haveli',31),
-- Daman and Diu (32)
('Daman',32),('Diu',32),
-- Delhi (33)
('Central Delhi',33),('East Delhi',33),('North Delhi',33),('South Delhi',33),('West Delhi',33),('New Delhi',33),('North East Delhi',33),('North West Delhi',33),('Shahdara',33),('South East Delhi',33),('South West Delhi',33),
-- Jammu and Kashmir (34)
('Srinagar',34),('Jammu',34),('Anantnag',34),('Baramulla',34),('Budgam',34),('Pulwama',34),('Kupwara',34),('Kathua',34),
-- Ladakh (35)
('Leh',35),('Kargil',35),
-- Lakshadweep (36)
('Lakshadweep',36),
-- Puducherry (37)
('Puducherry',37),('Karaikal',37),('Yanam',37),('Mahe',37)
ON CONFLICT DO NOTHING;
`;
const result = await executeSql({ sqlQuery: districtSeed });
console.log("Districts seeded:", result.success, result.output?.substring(0, 100) || result.exitReason);

