#!/bin/bash

# Script to create a package with only the changed frontend files

echo "=== Creating hPanel Deployment Package ==="
echo ""

WORK_DIR="/tmp/pawpk-hpanel-deploy"
rm -rf $WORK_DIR
mkdir -p $WORK_DIR

# Copy only the changed files maintaining directory structure
echo "Packaging changed files..."

mkdir -p $WORK_DIR/src/pages
mkdir -p $WORK_DIR/src/pages/admin
mkdir -p $WORK_DIR/src/components

cp "/Users/macbookpro/Documents/PAW PK/frontend/src/pages/Products.jsx" $WORK_DIR/src/pages/
cp "/Users/macbookpro/Documents/PAW PK/frontend/src/pages/Cart.jsx" $WORK_DIR/src/pages/
cp "/Users/macbookpro/Documents/PAW PK/frontend/src/pages/admin/AdminProducts.jsx" $WORK_DIR/src/pages/admin/
cp "/Users/macbookpro/Documents/PAW PK/frontend/src/components/Layout.jsx" $WORK_DIR/src/components/
cp "/Users/macbookpro/Documents/PAW PK/frontend/src/components/ImageGallery.jsx" $WORK_DIR/src/components/

echo "Files packaged:"
find $WORK_DIR -type f | sed 's|'$WORK_DIR'||'

# Create zip file
cd /tmp
zip -r pawpk-frontend-changes.zip pawpk-hpanel-deploy/

echo ""
echo "✓ Package created: /tmp/pawpk-frontend-changes.zip"
echo ""
echo "To download, run:"
echo "  open /tmp/pawpk-frontend-changes.zip"
echo ""
echo "Then upload the files to your hPanel in this structure:"
echo "  public_html/src/pages/Products.jsx"
echo "  public_html/src/pages/Cart.jsx"
echo "  public_html/src/pages/admin/AdminProducts.jsx"
echo "  public_html/src/components/Layout.jsx"
echo "  public_html/src/components/ImageGallery.jsx"
