import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('umap_price_matches')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch violations' },
        { status: 500 }
      )
    }

    // Return raw database data without transformation
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching violations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}