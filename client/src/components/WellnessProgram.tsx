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
  Button,
  Link,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";

// ───────────────────────────────────────────
// Types
// ───────────────────────────────────────────
type ContentCard = {
  type: "article" | "video";
  title: string;
  desc: string;
  url: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
};

// ───────────────────────────────────────────
// Component
// ───────────────────────────────────────────
const WellnessProgram: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");

  // Server-loaded content
  const [items, setItems] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ────────────────────────────────────────
  // Fetch from server (debounced by 300ms)
  // ────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          type: "all",
          q: search.trim(),
          limit: "30",
        });

        const resp = await fetch(`/api/wellness/content?${params.toString()}`);
        if (!resp.ok) {
          throw new Error(`Request failed: ${resp.status}`);
        }

        const data = await resp.json();
        const nextItems: ContentCard[] = Array.isArray(data?.items) ? data.items : [];

        if (alive) setItems(nextItems);
      } catch (e: any) {
        if (alive) {
          setItems([]);
          setError(e?.message || "Failed to load content");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    const t = setTimeout(load, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [search]);

  // ────────────────────────────────────────
  // Filtering + Sorting (client-side)
  // ────────────────────────────────────────
  const processedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const s = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(s) ||
        item.desc.toLowerCase().includes(s) ||
        (item.source ?? "").toLowerCase().includes(s)
      );
    });

    if (sortBy === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "recent") {
      filtered.sort((a, b) =>
        String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? ""))
      );
    }

    return filtered;
  }, [items, search, sortBy]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        px: 2,
        py: { xs: 4, sm: 6 },
      }}
    >
      {/* Header */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Wellness Program
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        mb={5}
        sx={{ maxWidth: 700, margin: "0 auto" }}
      >
        Explore curated exercises, mindfulness techniques, and migraine-friendly
        wellness strategies—personalized to help improve your daily well-being.
      </Typography>

      {/* Search + Sort Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <TextField
          fullWidth
          placeholder="Search wellness tips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ minWidth: 200 }}>
          <Select
            fullWidth
            value={sortBy}
            onChange={(e) => setSortBy(String(e.target.value))}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="az">Sort: A → Z</MenuItem>
            <MenuItem value="za">Sort: Z → A</MenuItem>
            <MenuItem value="recent">Sort: Most Recent</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Loading / Error */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Make sure your backend route <b>/api/wellness/content</b> is running.
          </Typography>
        </Box>
      )}

      {!loading && !error && processedItems.length === 0 && (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography color="text.secondary">
            No content found. Try a different keyword.
          </Typography>
        </Box>
      )}

      {/* Wellness Grid */}
      <Grid container spacing={3}>
        {processedItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${item.url}-${index}`}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "0.25s ease",
                overflow: "hidden",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              {/* Optional thumbnail */}
              {item.imageUrl && (
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    display: "block",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                />
              )}

              <CardContent>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Chip
                    size="small"
                    label={item.type === "video" ? "Video" : "Article"}
                    variant="outlined"
                  />
                  {item.source && (
                    <Chip size="small" label={item.source} variant="outlined" />
                  )}
                </Box>

                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 50 }}
                >
                  {item.desc}
                </Typography>

                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                >
                  {item.type === "video" ? "Watch" : "Read More"} »
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CTA */}
      <Box textAlign="center" mt={6}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: 8,
            px: 5,
            py: 1.5,
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          href="/goal-tracker"
        >
          Goal Tracker
        </Button>
      </Box>
    </Box>
  );
};

export default WellnessProgram;
