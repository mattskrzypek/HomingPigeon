export const SAMPLE = `From: Operations <notice@example.com>
To: Analyst <analyst@example.net>
Subject: Synthetic training message — account review
Date: Tue, 13 Oct 2026 09:00:00 +0000
Message-ID: <training-001@example.com>
Reply-To: Support <help@example.org>
Return-Path: <bounce@example.com>
Received: from relay.example.com (relay.example.com [198.51.100.20])
 by inbox.example.net with ESMTPS; Tue, 13 Oct 2026 09:00:05 +0000
Received: from workstation.example.com ([192.0.2.10])
 by relay.example.com with ESMTP; Tue, 13 Oct 2026 09:00:01 +0000
Authentication-Results: inbox.example.net;
 spf=pass smtp.mailfrom=example.com;
 dkim=fail header.d=example.com;
 dmarc=fail header.from=example.com
DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=training; b=SYNTHETIC
`;
