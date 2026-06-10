// TODO: Replace placeholder data with verified Bangladesh division/district/upazila dataset.
// Bangladesh has 8 divisions, 64+ districts, and 500+ upazilas.
// Source: https://en.wikipedia.org/wiki/Administrative_divisions_of_Bangladesh

export type Division = {
  id: string
  name: string
  nameBn: string
  districts: District[]
}

export type District = {
  id: string
  name: string
  nameBn: string
  divisionId: string
  upazilas: Upazila[]
}

export type Upazila = {
  id: string
  name: string
  nameBn: string
  districtId: string
}

// Placeholder - must be replaced with complete verified dataset
const PLACEHOLDER_DIVISIONS: Division[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    nameBn: "ঢাকা",
    districts: [
      {
        id: "dhaka-district",
        name: "Dhaka",
        nameBn: "ঢাকা জেলা",
        divisionId: "dhaka",
        upazilas: [
          { id: "dhaka-sadar", name: "Dhaka Sadar", nameBn: "ঢাকা সদর", districtId: "dhaka-district" },
          { id: "dohar", name: "Dohar", nameBn: "দোহার", districtId: "dhaka-district" },
          { id: "keraniganj", name: "Keraniganj", nameBn: "কেরাণীগঞ্জ", districtId: "dhaka-district" },
          { id: "savar", name: "Savar", nameBn: "সাভার", districtId: "dhaka-district" },
          { id: "tongi", name: "Tongi", nameBn: "টঙ্গী", districtId: "dhaka-district" },
        ],
      },
    ],
  },
  {
    id: "chattogram",
    name: "Chattogram",
    nameBn: "চট্টগ্রাম",
    districts: [
      {
        id: "chattogram-district",
        name: "Chattogram",
        nameBn: "চট্টগ্রাম জেলা",
        divisionId: "chattogram",
        upazilas: [
          { id: "chattogram-sadar", name: "Chattogram Sadar", nameBn: "চট্টগ্রাম সদর", districtId: "chattogram-district" },
          { id: "halishahar", name: "Halishahar", nameBn: "হালিশহর", districtId: "chattogram-district" },
          { id: "panchlaish", name: "Panchlaish", nameBn: "পাঁচলাইশ", districtId: "chattogram-district" },
          { id: "kotwali", name: "Kotwali", nameBn: "কোতোয়ালী", districtId: "chattogram-district" },
        ],
      },
    ],
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    nameBn: "রাজশাহী",
    districts: [],
  },
  {
    id: "sylhet",
    name: "Sylhet",
    nameBn: "সিলেট",
    districts: [],
  },
  {
    id: "khulna",
    name: "Khulna",
    nameBn: "খুলনা",
    districts: [],
  },
  {
    id: "barishal",
    name: "Barishal",
    nameBn: "বরিশাল",
    districts: [],
  },
  {
    id: "rangpur",
    name: "Rangpur",
    nameBn: "রংপুর",
    districts: [],
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    districts: [],
  },
]

export function getDivisions(): Division[] {
  return PLACEHOLDER_DIVISIONS
}

export function getDivisionById(id: string): Division | undefined {
  return PLACEHOLDER_DIVISIONS.find((d) => d.id === id)
}

export function getDistrictsByDivision(divisionId: string): District[] {
  const division = getDivisionById(divisionId)
  return division?.districts ?? []
}

export function getDistrictById(id: string): District | undefined {
  for (const division of PLACEHOLDER_DIVISIONS) {
    const district = division.districts.find((d) => d.id === id)
    if (district) return district
  }
  return undefined
}

export function getUpazilasByDistrict(districtId: string): Upazila[] {
  const district = getDistrictById(districtId)
  return district?.upazilas ?? []
}

export function getUpazilaById(id: string): Upazila | undefined {
  for (const division of PLACEHOLDER_DIVISIONS) {
    for (const district of division.districts) {
      const upazila = district.upazilas.find((u) => u.id === id)
      if (upazila) return upazila
    }
  }
  return undefined
}

export function searchDivisions(query: string): Division[] {
  const q = query.toLowerCase()
  return PLACEHOLDER_DIVISIONS.filter(
    (d) => d.name.toLowerCase().includes(q) || d.nameBn.includes(q)
  )
}

export function searchDistricts(query: string): District[] {
  const q = query.toLowerCase()
  const results: District[] = []
  for (const division of PLACEHOLDER_DIVISIONS) {
    for (const district of division.districts) {
      if (district.name.toLowerCase().includes(q) || district.nameBn.includes(q)) {
        results.push(district)
      }
    }
  }
  return results
}

export function searchUpazilas(query: string): Upazila[] {
  const q = query.toLowerCase()
  const results: Upazila[] = []
  for (const division of PLACEHOLDER_DIVISIONS) {
    for (const district of division.districts) {
      for (const upazila of district.upazilas) {
        if (upazila.name.toLowerCase().includes(q) || upazila.nameBn.includes(q)) {
          results.push(upazila)
        }
      }
    }
  }
  return results
}