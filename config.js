const SUPABASE_URL = "https://ltbrpbggbccudwckfqwg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0YnJwYmdnYmNjdWR3Y2tmcXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDYzNDQsImV4cCI6MjA5ODk4MjM0NH0.ZYVTIfSLsz9arloRikcJ_j1ZiTU9dnV2ImTur0YCTvM";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);