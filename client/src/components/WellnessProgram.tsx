import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, TextField,
  InputAdornment, MenuItem, Select, CircularProgress,
  Chip, Link, Button, useMediaQuery, useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

type ContentCard = {
  type: "article" | "video";
  title: string;
  desc: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

const WellnessProgram: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [items, setItems] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = window.location.hostname === "localhost" ? "http://localhost:5001" : "";

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type: "all", q: search.trim(), limit: "30" });
        const resp = await fetch(`${BACKEND_URL}/api/wellness/content?${params.toString()}`);
        
        if (!resp.ok) throw new Error(`Server error: ${resp.status}`);

        const data = await resp.json();
        console.log("Frontend received data:", data); // LOG TO BROWSER CONSOLE

        if (alive) setItems(data.items || []);
      } catch (e: any) {
        if (alive) setError("Could not connect to the video server.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(load, 500);
    return () => { alive = false; clearTimeout(t); };
  }, [search, BACKEND_URL]);

  const processedItems = useMemo(() => {
    let filtered = [...items];
    if (sortBy === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "za") filtered.sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [items, sortBy]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto", px: 2, py: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>Wellness Program</Typography>
      
      <Box sx={{ display: "flex", gap: 2, mb: 4, mt: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for migraine relief..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as string)}>
          <MenuItem value="recent">Recent</MenuItem>
          <MenuItem value="az">A-Z</MenuItem>
        </Select>
      </Box>

      {loading && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
      
      {!loading && processedItems.length === 0 && (
        <Typography textAlign="center">No videos found. Check your API key.</Typography>
      )}

      <Grid container spacing={3}>
        {processedItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              {item.imageUrl && <Box component="img" src={item.imageUrl} sx={{ width: "100%", height: 180, objectFit: "cover" }} />}
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.desc.substring(0, 100)}...</Typography>
                <Link href={item.url} target="_blank" fontWeight="bold">WATCH NOW »</Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WellnessProgram;