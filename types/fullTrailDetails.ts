interface FullTrailDetails {
    trail_name: string
    _changed: string
    _status: string
    all_trails_url: string | null
    hiking_project_url?: string | null
    id: string
    is_free: boolean
    is_subscribers_only: boolean
    nps_url?: string
    park_id: string
    park_image_url?: string | null
    park_name: string
    park_type: string
    state: string
    state_code: string
    trail_difficulty: string
    trail_distance: string
    trail_elevation: string
    trail_image_url?: string | null
    trail_lat: string
    trail_long: string
    trail_of_the_week: boolean
}
export default FullTrailDetails