///////////////////////////////////////////////////////////////////////
//pdf generation with car photo
// import React, { useState } from "react";
// import { StyleSheet, View, Text, Alert, ScrollView } from "react-native";
// import { TextInput, Button, Avatar } from "react-native-paper";
// import * as ImagePicker from "expo-image-picker";
// import { Formik } from "formik";
// import * as Yup from "yup";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import * as FileSystem from "expo-file-system"; // Import FileSystem to handle base64 conversion

// const API_URL = "http://192.168.119.101:5000/predict";

// const validationSchema = Yup.object().shape({
//   name: Yup.string().required("Car name is required"),
//   company: Yup.string().required("Company is required"),
//   year: Yup.number()
//     .required("Year is required")
//     .min(1900, "Enter a valid year")
//     .max(new Date().getFullYear(), "Year cannot be in the future"),
//   kms_driven: Yup.number()
//     .required("Kilometers driven is required")
//     .min(0, "Kilometers cannot be negative"),
//   fuel_type: Yup.string().required("Fuel type is required"),
// });

// const CarPriceForm = () => {
//   const [image, setImage] = useState(null);
//   const [imageBase64, setImageBase64] = useState(null); // Store base64-encoded image
//   const [predictedPrice, setPredictedPrice] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);

//   // Image Picker Function
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       const selectedImageUri = result.assets[0].uri;
//       setImage(selectedImageUri);

//       // Convert the image to base64
//       const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       setImageBase64(`data:image/jpeg;base64,${base64}`);
//     }
//   };

//   // Generate and Share PDF Function
//   const generateAndSharePDF = async (values) => {
//     const htmlContent = `
//       <html>
//         <body style="margin: 40px; font-family: Arial, sans-serif; text-align: center;">
//           <h1 style="margin-bottom: 20px;">Car Price Prediction Report</h1>
//           ${
//             imageBase64
//               ? `<img src="${imageBase64}" alt="Car Image" style="width: 50%; height: auto; margin-bottom: 20px;" />`
//               : ""
//           }
//           <p><strong>Car Name:</strong> ${values.name}</p>
//           <p><strong>Company:</strong> ${values.company}</p>
//           <p><strong>Year:</strong> ${values.year}</p>
//           <p><strong>Kilometers Driven:</strong> ${values.kms_driven}</p>
//           <p><strong>Fuel Type:</strong> ${values.fuel_type}</p>
//           <p><strong>Predicted Price:</strong> ₹${predictedPrice}</p>
//         </body>
//       </html>
//     `;

//     try {
//       const { uri } = await Print.printToFileAsync({ html: htmlContent });
//       await Sharing.shareAsync(uri);
//     } catch (error) {
//       console.error("Error generating or sharing PDF:", error);
//     }
//   };

//   const handleSubmit = (values, { setSubmitting }) => {
//     console.log("Submitting values:", values);
//     const formData = {
//       name: values.name.trim(),
//       company: values.company.trim(),
//       year: parseInt(values.year, 10),
//       kms_driven: parseInt(values.kms_driven, 10),
//       fuel_type: values.fuel_type.trim(),
//     };

//     fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         if (data.predicted_price !== undefined) {
//           setPredictedPrice(data.predicted_price.toFixed(2));
//           setErrorMessage(null);
//         } else {
//           throw new Error(data.error || "Prediction failed, try again.");
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching prediction:", error.message);
//         setErrorMessage("Error predicting price: " + error.message);
//       })
//       .finally(() => {
//         setSubmitting(false);
//       });
//   };

//   return (
//     <ScrollView style={styles.scrollContainer}>
//       <View style={styles.container}>
//         <Formik
//           initialValues={{
//             name: "",
//             company: "",
//             year: "",
//             kms_driven: "",
//             fuel_type: "",
//           }}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//         >
//           {({
//             handleChange,
//             handleBlur,
//             handleSubmit,
//             values,
//             errors,
//             touched,
//             isSubmitting,
//             resetForm,
//           }) => (
//             <View>
//               <Text style={styles.heading}>Car Price Prediction</Text>
//               <View style={styles.imagePicker}>
//                 <Avatar.Image
//                   size={100}
//                   source={image ? { uri: image } : undefined}
//                 />
//                 <Button
//                   mode="outlined"
//                   onPress={pickImage}
//                   style={styles.uploadButton}
//                 >
//                   Upload Car Image
//                 </Button>
//               </View>
//               <TextInput
//                 label="Car Name"
//                 style={styles.input}
//                 onChangeText={handleChange("name")}
//                 onBlur={handleBlur("name")}
//                 value={values.name}
//                 error={touched.name && errors.name}
//               />
//               {touched.name && errors.name && (
//                 <Text style={styles.error}>{errors.name}</Text>
//               )}
//               <TextInput
//                 label="Company"
//                 style={styles.input}
//                 onChangeText={handleChange("company")}
//                 onBlur={handleBlur("company")}
//                 value={values.company}
//                 error={touched.company && errors.company}
//               />
//               {touched.company && errors.company && (
//                 <Text style={styles.error}>{errors.company}</Text>
//               )}
//               <TextInput
//                 label="Year"
//                 style={styles.input}
//                 keyboardType="numeric"
//                 onChangeText={handleChange("year")}
//                 onBlur={handleBlur("year")}
//                 value={values.year}
//                 error={touched.year && errors.year}
//               />
//               {touched.year && errors.year && (
//                 <Text style={styles.error}>{errors.year}</Text>
//               )}
//               <TextInput
//                 label="Kilometers Driven"
//                 style={styles.input}
//                 keyboardType="numeric"
//                 onChangeText={handleChange("kms_driven")}
//                 onBlur={handleBlur("kms_driven")}
//                 value={values.kms_driven}
//                 error={touched.kms_driven && errors.kms_driven}
//               />
//               {touched.kms_driven && errors.kms_driven && (
//                 <Text style={styles.error}>{errors.kms_driven}</Text>
//               )}
//               <TextInput
//                 label="Fuel Type (e.g., Petrol, Diesel)"
//                 style={styles.input}
//                 onChangeText={handleChange("fuel_type")}
//                 onBlur={handleBlur("fuel_type")}
//                 value={values.fuel_type}
//                 error={touched.fuel_type && errors.fuel_type}
//               />
//               {touched.fuel_type && errors.fuel_type && (
//                 <Text style={styles.error}>{errors.fuel_type}</Text>
//               )}
//               {predictedPrice ? (
//                 <>
//                   <Text style={styles.resultText}>
//                     Predicted Price: ₹{predictedPrice}
//                   </Text>
//                   <Button
//                     mode="contained"
//                     onPress={() => generateAndSharePDF(values)}
//                     style={styles.submitButton}
//                   >
//                     Share PDF
//                   </Button>
//                   <Button
//                     mode="contained"
//                     onPress={() => {
//                       resetForm();
//                       setPredictedPrice(null);
//                       setImage(null);
//                       setImageBase64(null); // Reset base64 image
//                     }}
//                     style={styles.submitButton}
//                   >
//                     Refresh
//                   </Button>
//                 </>
//               ) : (
//                 <Button
//                   mode="contained"
//                   onPress={handleSubmit}
//                   style={styles.submitButton}
//                   disabled={isSubmitting}
//                 >
//                   Predict Price
//                 </Button>
//               )}
//               {errorMessage && (
//                 <Text style={styles.errorText}>{errorMessage}</Text>
//               )}
//             </View>
//           )}
//         </Formik>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f8f9fa",
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   imagePicker: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   uploadButton: {
//     marginLeft: 10,
//   },
//   input: {
//     marginBottom: 10,
//     backgroundColor: "white",
//   },
//   error: {
//     color: "red",
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   submitButton: {
//     marginTop: 20,
//   },
//   resultText: {
//     marginTop: 20,
//     fontSize: 20,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginTop: 10,
//   },
// });

// export default CarPriceForm;
//////////////////////////////////////////////////////////////////
//final pdf with car picture,logo,date and time.
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, ScrollView } from "react-native";
import { TextInput, Button, Avatar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system"; // Import FileSystem to handle base64 conversion
import { Asset } from "expo-asset";

const API_URL = "http://192.168.119.101:5000/predict";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Car name is required"),
  company: Yup.string().required("Company is required"),
  year: Yup.number()
    .required("Year is required")
    .min(1900, "Enter a valid year")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  kms_driven: Yup.number()
    .required("Kilometers driven is required")
    .min(0, "Kilometers cannot be negative"),
  fuel_type: Yup.string().required("Fuel type is required"),
});

const CarPriceForm = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null); // Store base64-encoded image
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null); // Store logo base64

  useEffect(() => {
    const loadLogo = async () => {
      const logo = Asset.fromModule(require("./image/logo.jpg"));
      await logo.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(logo.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLogoBase64(`data:image/png;base64,${base64}`);
    };
    loadLogo();
  }, []);

  // Image Picker Function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setImage(selectedImageUri);

      // Convert the image to base64
      const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  // Generate and Share PDF Function
  const generateAndSharePDF = async (values) => {
    const currentDate = new Date().toLocaleString();

    if (!logoBase64) {
      Alert.alert("Error", "Logo image not loaded yet.");
      return;
    }

    const htmlContent = `
      <html>
        <body style="margin: 40px; font-family: Arial, sans-serif; text-align: center; border: 2px solid #000;">
          <img src="${logoBase64}" alt="App Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
          <h1 style="margin-bottom: 20px;">Car Price Prediction Report</h1>
          <p><strong>Date:</strong> ${currentDate}</p>
          <hr style="margin-bottom: 20px;"/>
          ${
            imageBase64
              ? `<img src="${imageBase64}" alt="Car Image" style="width: 50%; height: auto; margin-bottom: 20px;" />`
              : ""
          }
          <p><strong>Car Name:</strong> ${values.name}</p>
          <p><strong>Company:</strong> ${values.company}</p>
          <p><strong>Year:</strong> ${values.year}</p>
          <p><strong>Kilometers Driven:</strong> ${values.kms_driven}</p>
          <p><strong>Fuel Type:</strong> ${values.fuel_type}</p>
          <p><strong>Predicted Price:</strong> ₹${predictedPrice}</p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    if (!values.name.trim()) {
      setErrorMessage("Invalid car name. Please enter a valid car brand.");
      setSubmitting(false);
      return;
    }
    const formData = {
      name: values.name.trim(),
      company: values.company.trim(),
      year: parseInt(values.year, 10),
      kms_driven: parseInt(values.kms_driven, 10),
      fuel_type: values.fuel_type.trim(),
    };

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.predicted_price !== undefined) {
          setPredictedPrice(data.predicted_price.toFixed(2));
          setErrorMessage(null);
        } else {
          throw new Error(data.error || "Prediction failed, try again.");
        }
      })
      .catch((error) => {
        console.error("Error fetching prediction:", error.message);
        setErrorMessage("Error predicting price: " + error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Formik
          initialValues={{
            name: "",
            company: "",
            year: "",
            kms_driven: "",
            fuel_type: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            resetForm,
          }) => (
            <View>
              <Text style={styles.heading}>Car Price Prediction</Text>
              <View style={styles.imagePicker}>
                <Avatar.Image
                  size={100}
                  source={image ? { uri: image } : undefined}
                />
                <Button
                  mode="outlined"
                  onPress={pickImage}
                  style={styles.uploadButton}
                >
                  Upload Car Image
                </Button>
              </View>
              <TextInput
                label="Car Name"
                style={styles.input}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                value={values.name}
                error={touched.name && errors.name}
              />
              {touched.name && errors.name && (
                <Text style={styles.error}>{errors.name}</Text>
              )}
              <TextInput
                label="Company"
                style={styles.input}
                onChangeText={handleChange("company")}
                onBlur={handleBlur("company")}
                value={values.company}
                error={touched.company && errors.company}
              />
              {touched.company && errors.company && (
                <Text style={styles.error}>{errors.company}</Text>
              )}
              <TextInput
                label="Year"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange("year")}
                onBlur={handleBlur("year")}
                value={values.year}
                error={touched.year && errors.year}
              />
              {touched.year && errors.year && (
                <Text style={styles.error}>{errors.year}</Text>
              )}
              <TextInput
                label="Kilometers Driven"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange("kms_driven")}
                onBlur={handleBlur("kms_driven")}
                value={values.kms_driven}
                error={touched.kms_driven && errors.kms_driven}
              />
              {touched.kms_driven && errors.kms_driven && (
                <Text style={styles.error}>{errors.kms_driven}</Text>
              )}
              <TextInput
                label="Fuel Type (e.g., Petrol, Diesel)"
                style={styles.input}
                onChangeText={handleChange("fuel_type")}
                onBlur={handleBlur("fuel_type")}
                value={values.fuel_type}
                error={touched.fuel_type && errors.fuel_type}
              />
              {touched.fuel_type && errors.fuel_type && (
                <Text style={styles.error}>{errors.fuel_type}</Text>
              )}
              {predictedPrice ? (
                <>
                  <Text style={styles.resultText}>
                    Predicted Price: ₹{predictedPrice}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => generateAndSharePDF(values)}
                    style={styles.submitButton}
                  >
                    Share PDF
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      resetForm();
                      setPredictedPrice(null);
                      setImage(null);
                      setImageBase64(null); // Reset base64 image
                    }}
                    style={styles.submitButton}
                  >
                    Refresh
                  </Button>
                </>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={isSubmitting}
                >
                  Predict Price
                </Button>
              )}
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  uploadButton: {
    marginLeft: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "white",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 20,
  },
  resultText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default CarPriceForm;
/////////////////////////////////////////////////////////
