/**
 * Load schools data from JSON file
 */
import schoolsDataJson from '../../schools_data.json'
import { SchoolData } from './aiSchools'

export function loadSchoolsData(): SchoolData[] {
  // Type assertion since we know the structure
  return schoolsDataJson as SchoolData[]
}
