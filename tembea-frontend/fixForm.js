const fs = require('fs');
let file = 'src/components/partner/listings/ListingForm.tsx';
let content = fs.readFileSync(file, 'utf-8');

const regex = /      extraData: \{\s*\.\.\.rawData,\s*type: listingType,\s*\},\s*\};\s*\};\s*import type \{ ListingType, AnyListing \} from "@\/types\/listing\.types";[\s\S]*?export function ListingForm\(\{ listingType, data, onChange \}: Props\) \{/m;

if (regex.test(content)) {
  content = content.replace(regex, `      extraData: {
        ...rawData,
        type: listingType,
      },
    };
  };

  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(null);
    setIsPublishing(true);

    try {
      await listingsApi.create(buildListingPayload());
      setPublishSuccess("Listing submitted successfully! It is now pending admin approval.");
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "Failed to submit listing.");
    } finally {
      setIsPublishing(false);
    }
  };

  const renderAccommodationForm = () => (`);
  
  // also change the button text
  content = content.replace('{isPublishing ? "Publishing..." : "Publish Listing"}', '{isPublishing ? "Submitting..." : "Submit for Review"}');
  
  fs.writeFileSync(file, content);
  console.log("Fixed!");
} else {
  console.log("Regex did not match. Let's dump the snippet.");
  console.log(content.substring(content.indexOf('extraData: {'), content.indexOf('const renderAccommodationForm')));
}
