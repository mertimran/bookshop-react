import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Paper,
  Divider,
  Grid,
  Container,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { catalogApi, type Book } from "@bookshop/shared/api";
import { addToCart } from "../../cart";

export const Route = createFileRoute("/books/$bookId")({
  component: BookDetailPage,
});

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #1A7B6E 0%, #2A9D8F 100%)",
  "linear-gradient(135deg, #E89C20 0%, #F5C565 100%)",
  "linear-gradient(135deg, #145F55 0%, #1A7B6E 100%)",
];

function BookDetailPage() {
  const { bookId } = Route.useParams();
  const { t } = useTranslation();
  const theme = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi
      .getBook(bookId)
      .then(setBook)
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Skeleton width={120} height={40} sx={{ mb: 3 }} />
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton
                variant="rounded"
                height={350}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton width="60%" height={48} />
              <Skeleton width="30%" height={32} sx={{ mt: 1 }} />
              <Skeleton width="100%" height={120} sx={{ mt: 3 }} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography color="error">{t("error")}</Typography>
      </Container>
    );
  }

  const gradientIndex = book.title.charCodeAt(0) % COVER_GRADIENTS.length;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button
        component={Link}
        to="/books"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        {t("backToBooks")}
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: "divider" }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                height: 380,
                background: COVER_GRADIENTS[gradientIndex],
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 800,
                  fontSize: "6rem",
                }}
              >
                {book.title.charAt(0)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
              {book.title}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={400}
              sx={{ mb: 2 }}
            >
              {book.author?.name || book.authorName}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Rating
                value={book.rating}
                precision={0.1}
                readOnly
                sx={{ color: "secondary.main" }}
              />
              <Typography variant="body1" fontWeight={600}>
                ({book.rating})
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {book.genres?.map((bg) => (
                <Chip
                  key={bg.ID}
                  label={bg.genre?.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, color: "text.secondary", mb: 3 }}
            >
              {book.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t("price")}
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={800}>
                  ${book.price}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t("inStock")}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={
                      book.stock > 0
                        ? `${book.stock} ${t("inStock")}`
                        : t("outOfStock")
                    }
                    color={book.stock > 0 ? "success" : "error"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t("isbn")}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.isbn}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t("publishedDate")}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.publishedDate}
                </Typography>
              </Grid>
            </Grid>

            {book.publisher && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("publisher")}: <strong>{book.publisher.name}</strong>
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={book.stock < 1}
              onClick={() => addToCart(book)}
              sx={{ px: 4 }}
            >
              {t("addToCart")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
