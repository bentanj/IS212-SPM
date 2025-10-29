// Only required if Button to Home Page is enabled
"use client"
// import Link from "next/link"
// import { Button } from "@mui/material"
// import { Home } from "@mui/icons-material"
import { Container, Typography } from "@mui/material"

export default function Page() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h3" color="error" gutterBottom>
        Not Authorized
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        You do not have permission to access this page.<br />
        Please contact your administrator if you believe this is an error.
        {/* <Link href="./">
          <Button variant="contained" color="primary" startIcon={<Home />} sx={{ mt: 3 }}>
            Return to Home Page
          </Button>
        </Link> */}
      </Typography>
    </Container>
  )
}