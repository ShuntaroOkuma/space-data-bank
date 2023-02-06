import NextLink from "next/link";
import {
  Flex,
  useColorModeValue,
  Spacer,
  Heading,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";

const siteTitle = "Space Data Bank";

const Header = () => {
  return (
    <Flex
      as="header"
      bg={useColorModeValue("gray.100", "gray.900")}
      p={4}
      alignItems="center"
    >
      <LinkBox as="span">
        <NextLink href={"/"} passHref>
          <LinkOverlay as="span">
            <Heading size="md">{siteTitle}</Heading>
          </LinkOverlay>
        </NextLink>
      </LinkBox>
      <Spacer />
    </Flex>
  );
};

export default Header;
