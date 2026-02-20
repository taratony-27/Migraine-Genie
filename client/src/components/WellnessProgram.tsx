// client/src/components/WellnessProgram.tsx
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
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SortIcon from "@mui/icons-material/Sort";
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

function safeHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  return t.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const WellnessProgram: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

    const t = window.setTimeout(load, 450);
    return () => {
      alive = false;
      window.clearTimeout(t);
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
    // Fix “shifted to right”: remove extra centering offsets and force full width.
    <Box sx={{ width: "100%", maxWidth: "100%", mx: 0, px: { xs: 0, sm: 0 }, py: 1 }}>
      {/* Header */}
      <Box sx={{ px: { xs: 0, sm: 0 }, mb: 2 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} textAlign="left" gutterBottom>
          Wellness Program
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 900 }}>
          Curated tips and videos for migraine relief. Search by a symptom or trigger (e.g., sleep, stress, screen).
        </Typography>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          mb: 2,
          width: "100%",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search (e.g. sleep, stress, neck pain)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "az" | "za")}
          size="small"
          sx={{
            minWidth: { xs: "100%", sm: 180 },
            borderRadius: 2,
          }}
          startAdornment={
            <InputAdornment position="start">
              <SortIcon fontSize="small" />
            </InputAdornment>
          }
        >
          <MenuItem value="recent">Most recent</MenuItem>
          <MenuItem value="az">Title A–Z</MenuItem>
          <MenuItem value="za">Title Z–A</MenuItem>
        </Select>
      </Box>

      {/* Meta / Debug (cleaner) */}
      {meta && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={`YouTube: ${meta.youtubeCount ?? 0}`} />
            <Chip size="small" label={`Curated: ${meta.curatedCount ?? 0}`} />
            {meta.ytSearchQuery && (
              <Chip size="small" variant="outlined" label={`Query: ${meta.ytSearchQuery}`} />
            )}
          </Stack>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* States */}
      {loading && (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Loading recommendations…
          </Typography>
        </Box>
      )}

      {!loading && error && (
        <Box sx={{ py: 2 }}>
          <Typography color="error" fontWeight={700}>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check your server is running and `/api/wellness/content` is reachable.
          </Typography>
        </Box>
      )}

      {!loading && !error && processedItems.length === 0 && (
        <Box sx={{ py: 4 }}>
          <Typography fontWeight={700}>No results found.</Typography>
          <Typography variant="body2" color="text.secondary">
            Try a broader keyword like “migraine relief”, “sleep”, or “stress”.
          </Typography>
        </Box>
      )}

      {/* Cards grid */}
      {!loading && !error && processedItems.length > 0 && (
        <Grid container spacing={2} sx={{ m: 0, width: "100%" }}>
          {processedItems.map((item, index) => {
            const isVideo = item.type === "video";
            const host = safeHost(item.url);
            const dateLabel = formatDate(item.publishedAt);
            const title = item.title?.trim() || "Untitled";
            const desc = (item.desc || "").trim();

            return (
              <Grid item xs={12} sm={6} lg={4} key={`${item.url}-${index}`} sx={{ pl: "0 !important" }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    transition: "0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {/* Media */}
                  {item.imageUrl ? (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: 190,
                        backgroundColor: "action.hover",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.imageUrl}
                        alt={title}
                        loading="lazy"
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {/* Type badge */}
                      <Chip
                        size="small"
                        icon={isVideo ? <PlayCircleOutlineIcon /> : <ArticleOutlinedIcon />}
                        label={isVideo ? "Video" : "Article"}
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: "rgba(255,255,255,0.92)",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 90,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Chip
                        size="small"
                        icon={isVideo ? <PlayCircleOutlineIcon /> : <ArticleOutlinedIcon />}
                        label={isVideo ? "Video" : "Article"}
                        sx={{ bgcolor: "rgba(255,255,255,0.9)", fontWeight: 700 }}
                      />
                    </Box>
                  )}

                  <CardContent sx={{ p: 2.2 }}>
                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      sx={{
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {title}
                    </Typography>

                    {/* Meta line */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: "wrap" }}>
                      {item.source && <Chip size="small" variant="outlined" label={item.source} />}
                      {host && <Chip size="small" variant="outlined" label={host} />}
                      {dateLabel && <Chip size="small" variant="outlined" label={dateLabel} />}
                    </Stack>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1.2,
                        minHeight: 44,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {desc || "No description available."}
                    </Typography>

                    {/* Actions */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        underline="none"
                        sx={{
                          fontWeight: 900,
                          color: theme.palette.primary.main,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.6,
                        }}
                      >
                        Open <OpenInNewIcon sx={{ fontSize: 18 }} />
                      </Link>

                      <Tooltip title="Open in new tab">
                        <IconButton
                          size="small"
                          onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default WellnessProgram;