import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all records with pagination (Supabase limits to 1000 per request)
    let allData = []
    let page = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('umap_price_matches')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch violations' },
          { status: 500 }
        )
      }

      if (!data || data.length === 0) {
        break // No more data
      }

      allData = allData.concat(data)
      page++

      // Safety check to prevent infinite loops
      if (page > 10) break
    }

    // Return all data
    return NextResponse.json(allData)
  } catch (error) {
    console.error('Error fetching violations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}