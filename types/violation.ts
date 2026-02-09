export interface Violation {
  id: number
  created_at: string
  name: string
  umap_cleaned_name: string
  site: string
  umap_price: number
  list_price: number
  product_link: string
  html_file: string
  immersive_product_page_token: string
  diff: number
  per_diff: number
  date: string
  gender: string
  violation: boolean
  confidence_score: number
}
