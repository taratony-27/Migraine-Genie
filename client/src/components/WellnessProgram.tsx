import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  CircularProgress,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../services/api";

type ContentCard = {
  type: "article" | "video";
  title: string;
  desc: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

type WellnessResponse = {
  items: ContentCard[];
  message?: string;
  meta?: {
    youtubeCount?: number;
    curatedCount?: number;
    ytSearchQuery?: string;
  };
};

const WellnessProgram: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "az" | "za">("recent");

  const [items, setItems] = useState<ContentCard[]>([]);
  const [meta, setMeta] = useState<WellnessResponse["meta"] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<WellnessResponse>("/api/wellness/content", {
          params: { type: "all", q: search.trim(), limit: 30 },
        });

        if (!alive) return;

        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setMeta(res.data?.meta ?? null);
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setMeta(null);
        setError(e?.response?.data?.message || e?.message || "Failed to load wellness content.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(load, 500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search]);

  const processedItems = useMemo(() => {
    const arr = [...items];

    if (sortBy === "az") arr.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "za") arr.sort((a, b) => b.title.localeCompare(a.title));
    else {
      arr.sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      });
    }

    return arr;
  }, [items, sortBy]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto", px: 2, py: 6 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Wellness Program
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for migraine relief..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <MenuItem value="recent">Recent</MenuItem>
          <MenuItem value="az">A-Z</MenuItem>
          <MenuItem value="za">Z-A</MenuItem>
        </Select>
      </Box>

      {/* optional debug line */}
      {meta && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          YouTube: {meta.youtubeCount ?? 0} • Curated: {meta.curatedCount ?? 0}
        </Typography>
      )}

      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Typography textAlign="center" color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && processedItems.length === 0 && (
        <Typography textAlign="center">No videos found.</Typography>
      )}

      <Grid container spacing={3}>
        {processedItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              {item.imageUrl && (
                <Box
                  component="img"
                  src={item.imageUrl}
                  sx={{ width: "100%", height: 180, objectFit: "cover" }}
                />
              )}
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {(item.desc || "").slice(0, 120)}
                  {(item.desc || "").length > 120 ? "..." : ""}
                </Typography>
                <Link href={item.url} target="_blank" rel="noreferrer" fontWeight="bold">
                  WATCH NOW »
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WellnessProgram;